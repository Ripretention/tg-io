import {Api} from "./src/Api";
import {Polling} from "./src/Polling";
import {UpdateHandler} from "./src/UpdateHandler";
import {MessageBuilder} from "./src/MessageBuilder";
import * as Keyboard from "./src/KeyboardBuilder";

export class Tg {
	constructor(private readonly token: string) {}

	public readonly api = new Api(this.token);
	public readonly polling = new Polling(this.api);
	public readonly updates = new UpdateHandler(this.api);

	public createKeyboard = () => new Keyboard.KeyboardBuilder();
	public createInlineKeyboard = () => new Keyboard.InlineKeyboardBuilder();

	public startPolling() {
		return this.polling.start(this.updates);
	}
}
export { 
	Api as TgApi, 
	Polling as TgPolling, 
	UpdateHandler as TgUpdateHandler,
	MessageBuilder as TgMessageBuilder,
	Keyboard as TgKeyboard
};
