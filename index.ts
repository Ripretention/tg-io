import {Api} from "./src/Api";
import {Polling} from "./src/Polling";
import {UpdateHandler} from "./src/UpdateHandler";

export class Tg {
	constructor(private readonly token: string) {}
	public readonly api = new Api(this.token);
	public readonly updates = new UpdateHandler(this.api);
	public readonly polling = new Polling(this.api);
}
export { Api as TgApi, Polling as TgPolling, UpdateHandler as TgUpdateHandler };
