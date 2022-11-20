import axios, {AxiosError, AxiosResponse} from "axios";
import * as debug from "debug";
import * as FormData from "form-data";
import {IApiResult} from "./types/IUpdate";

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
			for (let [key, value] of Object.entries(params))
				formdata.append(key, value);
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
				let error = new ApiError(reqError?.response?.data ?? reqError.message);
				error.code = reqError?.response?.data?.code ?? reqError.code;
				error.method = method;
				error.params = JSON.stringify(params, null, 2);
				throw error;
			}

			throw reqError;
		} finally {
			this.log(`${method} ${response ? "OK" : "ERROR"}`);
		}

		return response.data;
	}
}
