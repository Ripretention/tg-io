import * as Context from "../src/contexts";
import { IUpdateResult } from "../src/types";
import { UpdateHandler } from "../src/UpdateHandler";
import {
	Command,
	Event,
	Update,
	Use,
	CallbackQuery,
} from "../src/decorators/UpdateHandlerDecorators";

const baseUpdate: IUpdateResult = {
	update_id: 132,
	message: {
		message_id: 1,
		date: null,
		text: "/test command",
	},
	callback_query: {
		id: "qwe123",
		chat_instance: "qwe",
		from: {
			id: 1,
			is_bot: false,
			first_name: "Durov",
		},
		data: "nodata",
	},
};
class UniversalTestHandler {
	public payload: string;

	public commandOutput: string;
	@Command(/test command/i)
	public testCommandDecorator(ctx: Context.Message, next: () => void) {
		this.commandOutput = ctx.id.toString() + this.payload;
		next();
	}

	public callbackData: string;
	@CallbackQuery("nodata")
	public testCallbackQueryDecorator(
		ctx: Context.CallbackQuery,
		next: () => void
	) {
		this.callbackData = ctx.data;
		next();
	}

	public useOutput: string;
	@Use()
	public testUseDecorator(upd: IUpdateResult, next: () => void) {
		this.useOutput = upd.update_id.toString();
		next();
	}

	public eventOutput = 0;
	@Event("photo")
	public testEventDecorator(_: unknown, next: () => void) {
		++this.eventOutput;
		next();
	}

	public updateOutput: string[] = [];
	@Update("message")
	public testUpdateMsg(_: unknown, next: () => void) {
		this.updateOutput.push("message");
		next();
	}
	@Update("callback_query")
	public testUpdateCb(_: unknown, next: () => void) {
		this.updateOutput.push("callback_query");
		next();
	}
}

let decoratedHandler = new UniversalTestHandler();
let handler = new UpdateHandler(null);
beforeEach(() => {
	handler = new UpdateHandler(null);
	decoratedHandler = new UniversalTestHandler();
});

test("should handle command correctly, given that the context must be correct", async () => {
	decoratedHandler.payload = "lol";
	handler.implementDecorators(decoratedHandler);

	await handler.handle(baseUpdate);
	let result = decoratedHandler.commandOutput;

	expect(result).toBe("1lol");
});

test("should handle callback_query correctly", async () => {
	handler.implementDecorators(decoratedHandler);

	await handler.handle(baseUpdate);
	let result = decoratedHandler.callbackData;

	expect(result).toBe(baseUpdate.callback_query.data);
});

test("should get correct update_id from use handler", async () => {
	handler.implementDecorators(decoratedHandler);

	await handler.handle(baseUpdate);
	let result = decoratedHandler.useOutput;

	expect(result).toBe(baseUpdate.update_id.toString());
});

test("should match event type correctly", async () => {
	let upd = JSON.parse(JSON.stringify(baseUpdate));
	upd.message.text = "";
	upd.message.photo = [
		{
			file_id: "lol",
			file_unique_id: "lol2",
			height: 100,
			width: 100,
		},
	];
	handler.implementDecorators(decoratedHandler);

	await handler.handle(upd);
	await handler.handle(baseUpdate);
	let result = decoratedHandler.eventOutput;

	expect(result).toBe(1);
});

test("should handle several very updates correctly", async () => {
	handler.implementDecorators(decoratedHandler);

	await handler.handle(baseUpdate);
	let result = decoratedHandler.updateOutput;

	expect(result).toEqual(["message", "callback_query"]);
});
