import { Api } from "./src/Api";
import { EventTransport, Polling } from "./src/transports";
import { UpdateHandler } from "./src/UpdateHandler";
import * as Keyboard from "./src/models/keyboard";
import { BotCommandList } from "./src/commands/BotCommandList";
import { BotCommandUploader } from "./src/commands/BotCommandUploader";

export class Tg {
	constructor(private readonly token: string) {}

	public eventTransport: EventTransport;
	public readonly commands = new BotCommandList();
	public readonly api = new Api(this.token);
	public readonly updates = new UpdateHandler(this.api);

	public createKeyboard = () => new Keyboard.KeyboardBuilder();
	public createInlineKeyboard = () => new Keyboard.InlineKeyboardBuilder();

	public startPolling() {
		this.eventTransport = new Polling(this.api);
		return this.eventTransport.start(this.updates);
	}
	public async uploadCommands() {
		let uploader = new BotCommandUploader(this.api);
		return uploader.upload(this.commands);
	}
}
export {
	Api as TgApi,
	Polling as TgPolling,
	UpdateHandler as TgUpdateHandler,
	Keyboard as TgKeyboard,
	BotCommandList as TgBotCommandList,
};
export {
	Use as TgUse,
	Event as TgEvent,
	Update as TgUpdate,
	Command as TgCommand,
	CallbackQuery as TgCallbackQuery,
} from "./src/decorators/UpdateHandlerDecorators";
export * as TgEntity from "./src/types";
export * as TgModel from "./src/models";
export * as TgContext from "./src/contexts";
export * as TgParam from "./src/types/params";
export * as TgAttachment from "./src/models/attachments";
export { CommandInfo as TgCommandInfo } from "./src/commands/BotCommandDecorators";
