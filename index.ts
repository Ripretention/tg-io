import {Api} from "./src/Api";
import {EventTransport, Polling} from "./src/transports";
import {UpdateHandler} from "./src/UpdateHandler";
import {MessageBuilder} from "./src/MessageBuilder";
import * as Keyboard from "./src/KeyboardBuilder";

export class Tg {
	constructor(private readonly token: string) {}

	public eventTransport: EventTransport;
	public readonly api = new Api(this.token);
	public readonly updates = new UpdateHandler(this.api);

	public createKeyboard = () => new Keyboard.KeyboardBuilder();
	public createInlineKeyboard = () => new Keyboard.InlineKeyboardBuilder();

	public startPolling() {
		this.eventTransport = new Polling(this.api);
		return this.eventTransport.start(this.updates);
	}
}
export { 
	Api as TgApi, 
	Polling as TgPolling, 
	UpdateHandler as TgUpdateHandler,
	MessageBuilder as TgMessageBuilder,
	Keyboard as TgKeyboard,
};
export * as TgEntity from "./src/types";
export * as TgModel from "./src/models";
export * as TgContext from "./src/contexts";
export * as TgParams from "./src/types/params";
export * as TgAttachment from "./src/models/attachments";
