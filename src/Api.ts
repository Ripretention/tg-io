import axios, {AxiosError, AxiosResponse} from "axios";
import * as debug from "debug";
export class ApiError extends Error {
	public code: number;
	public method: string;
	public params: string;
}

export class Api {
	private readonly log = debug("tg-io:api");
	private readonly baseUrl = "https://api.telegram.org/bot";
	constructor(private readonly token: string) {}

	public async callMethod<TResult extends { ok: boolean }>(method: string, params: Record<string, any>): Promise<TResult> {
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
