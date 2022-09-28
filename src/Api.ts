import axios from "axios";
import * as debug from "debug";

export class Api {
	private readonly log = debug("tg-io:api");
	private readonly baseUrl = "https://api.telegram.org/bot";
	constructor(private readonly token: string) {}

	public async callMethod(method: string, params: Record<string, any>) {
		let response = await axios.post(`${this.baseUrl}${this.token}/${method}`, params);

		this.log(`${method} ${response ? "OK" : "ERROR"}`);
		return response.data;	
	}
}
