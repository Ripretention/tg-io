import axios, {AxiosError, AxiosResponse} from "axios";
import * as debug from "debug";
import * as FormData from "form-data";
import {ReadStream} from "fs";
import {IApiResult, IUpdateFailed} from "./types/IUpdate";

export class ApiError extends Error {
	public code: number;
	public method: string;
	public params: string;
}

export class Api {
	private readonly log = debug("tg-io:api");
	private readonly baseUrl = "https://api.telegram.org/bot";
	constructor(private readonly token: string) {}

	/**
	 * Call method with params as a formdata 
	 */
	public async upload<TResult>(method: string, params: Record<string, any> | FormData) {
		if (!(params instanceof FormData)) {
			let formdata = new FormData();
			for (let [key, value] of Object.entries(params)) {
				let filename: string = null;
				if (Buffer.isBuffer(value))
					filename = "file.data";
				else if (ReadStream.isReadable(value))
					filename = (value as ReadStream)?.path?.toString() ?? "file.data";
				formdata.append(key, value, filename);
			}
			params = formdata;
		}

		return this.callMethod<TResult>(method, params);
	}
	public async callMethod<TResult>(method: string, params: Record<string, any>): Promise<IApiResult<TResult>> {
		let response: AxiosResponse<any, any>;
		try {
			response = await axios.post(`${this.baseUrl}${this.token}/${method}`, params);
		} catch (reqError) {
			if (reqError instanceof AxiosError) {
				let errorData = reqError?.response?.data as IUpdateFailed;
				if (errorData == null)
					throw reqError;

				let error = new ApiError(errorData.description);
				error.code = errorData.error_code;
				error.method = method;
				error.params = JSON.stringify(params);
				throw error;
			}

			throw reqError;
		} finally {
			this.log(`${method} ${response ? "OK" : "ERROR"}`);
		}

		return response.data;
	}
}
