import { errors, Client, Dispatcher, FormData, request } from "undici";
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
	private readonly keepAliveClient: Client;

	constructor(
		private readonly token: string,
		keepAliveClientOptions: Client.Options = { keepAliveTimeout: 6e3 }
	) {
		this.keepAliveClient = new Client(this.baseUrl, keepAliveClientOptions);
		this.keepAliveClient.on("connect", () =>
			this.log("keep-alive connection created")
		);
		this.keepAliveClient.on("disconnect", () =>
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
		params: SupportedParamsBody,
		keepAlive = false
	) {
		let response: Dispatcher.ResponseData;
		try {
			let requestOptions: Dispatcher.RequestOptions = {
				method: "POST",
				path: `/bot${this.token}/${method}`,
				...this.parseParams(params),
				throwOnError: true,
			};
			response = keepAlive
				? await this.keepAliveClient.request(requestOptions)
				: await request(this.baseUrl, requestOptions);
		} catch (err) {
			this.handleTelegramApiError(err, method, JSON.stringify(params));
		} finally {
			this.log(`${method} ${response ? "OK" : "ERROR"}`);
		}

		return (await response.body.json()) as IApiResult<TResult>;
	}
	private parseParams(
		params: SupportedParamsBody
	): Partial<Dispatcher.RequestOptions> {
		if (params instanceof FormData) {
			return {
				body: params,
			};
		}
		let body = JSON.stringify(params);
		return {
			body,
			headers: {
				"Content-Type": "application/json",
			},
		};
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
