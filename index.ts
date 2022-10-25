import {Api} from "./src/Api";
import {Polling} from "./src/Polling";
import {UpdateHandler} from "./src/UpdateHandler";
import {MessageBuilder} from "./src/MessageBuilder";

export class Tg {
	constructor(private readonly token: string) {}

	public readonly api = new Api(this.token);
	public readonly polling = new Polling(this.api);
	public readonly updates = new UpdateHandler(this.api);

	public startPolling() {
		return this.polling.start(this.updates);
	}
}
export { 
	Api as TgApi, 
	Polling as TgPolling, 
	UpdateHandler as TgUpdateHandler,
	MessageBuilder as TgMessageBuilder
};
