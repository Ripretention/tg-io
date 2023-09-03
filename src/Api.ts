import { errors, Client, Dispatcher, FormData } from "undici";
import * as debug from "debug";
import { ReadStream } from "fs";
import { IApiResult, IUpdateFailed } from "./types/IUpdate";

export class ApiError extends Error {
	public code: number;
	public method: string;
	public params: string;
}

export type SupportedParamsBody = Record<string, unknown> | FormData;

export class Api {
	private readonly log = debug("tg-io:api");
	private readonly baseUrl = `https://api.telegram.org`;
	public clientOptions: Client.Options = { keepAliveTimeout: 6e3 };
	private readonly client = new Client(this.baseUrl);

	constructor(private readonly token: string, client?: Client) {
		this.client = client ?? this.client;
		this.client.on("connect", () =>
			this.log("keep-alive connection created")
		);
		this.client.on("disconnect", () =>
			this.log("keep-alive connection closed")
		);
	}

	/**
	 * Call method with params as a formdata
	 */
	public async upload<TResult>(method: string, params: SupportedParamsBody) {
		if (!(params instanceof FormData)) {
			let formdata = new FormData();
			for (let [key, value] of Object.entries(params)) {
				let filename: string = null;
				if (Buffer.isBuffer(value)) {
					filename = "file.data";
				} else if (
					value instanceof ReadStream &&
					ReadStream.isReadable(value)
				) {
					filename = value.path?.toString() ?? "file.data";
				}
				formdata.append(key, value, filename);
			}
			params = formdata;
		}

		return this.callMethod<TResult>(method, params);
	}

	public async callMethod<TResult>(
		method: string,
		params: SupportedParamsBody
	) {
		let response: Dispatcher.ResponseData;
		try {
			response = await this.client.request({
				method: "POST",
				path: `/bot${this.token}/${method}`,
				...this.parseParams(params),
				throwOnError: true,
			});
		} catch (err) {
			this.handleTelegramApiError(err, method, JSON.stringify(params));
		} finally {
			this.log(`${method} ${response ? "OK" : "ERROR"}`);
		}

		return (await response.body.json()) as IApiResult<TResult>;
	}
	private parseParams(params: SupportedParamsBody) {
		if (params instanceof FormData) {
			return { body: params };
		}
		return { body: JSON.stringify(params) };
	}
	private handleTelegramApiError(
		err: unknown,
		method: string,
		params: string
	) {
		if (!(err instanceof errors.ResponseStatusCodeError)) {
			throw err;
		}

		let body: undefined | Record<string, any> = undefined;
		if (typeof err.body === "string") {
			try {
				body = JSON.parse(err.body);
			} catch (_) {
				body = undefined;
			}
		} else {
			body = err.body;
		}
		if (!body) {
			throw err;
		}

		let errorData = body as IUpdateFailed;
		let error = new ApiError(errorData.description);
		error.code = errorData.error_code;
		error.method = method;
		error.params = params;

		throw error;
	}
}
