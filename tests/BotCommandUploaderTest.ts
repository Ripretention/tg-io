import {CommandInfo} from "../src/commands/BotCommandDecorators";
import {BotCommandList} from "../src/commands/BotCommandList";
import {BotCommandUploader} from "../src/commands/BotCommandUploader";
import {IBotCommand} from "../src/types/IBotCommand";
import {ApiMock} from "./utils/ApiMock";

const apiMock = new ApiMock();
const cmdUploader = new BotCommandUploader(apiMock.get());
function hearSetCommands(cb: (p?: any) => any) {
	apiMock.addCallback("setMyCommands", params => {
		cb(params);

		return Promise.resolve({ 
			ok: true, 
			result: null
		});
	});
}
function hearGetCommands(expected: IBotCommand[]) {
	apiMock.addCallback("getMyCommands", () => {
		return Promise.resolve({ 
			ok: true, 
			result: expected
		});
	});
}
beforeEach(() => {
	apiMock.clear();
});

test("should correctly set command list", async () => {
	let result: Record<string, any>;
	let list = new BotCommandList().add("/test", "a test command");
	hearGetCommands([]);
	hearSetCommands(p => { result = p; });
	
	await cmdUploader.upload(list);

	expect(result).toStrictEqual({
		commands: [{
			command: "/test",
			description: "a test command"
		}],
		language_code: "",
		scope: { type: "default" }
	});
});
test("should correctly add several commands in a command list", async () => {
	let result: Record<string, any>;
	let list = new BotCommandList()
		.add("test", "a test command")
		.add("test2", "a test command2");
	hearGetCommands([]);
	hearSetCommands(p => { result = p; });
	
	await cmdUploader.upload(list);

	expect(result).toStrictEqual({
		commands: [
			{
				command: "test",
				description: "a test command"
			},
			{
				command: "test2",
				description: "a test command2"
			}
		],
		language_code: "",
		scope: { type: "default" }
	});
});
test("should correctly set multilanguage command list", async () => {
	let result: Record<string, any>[] = [];
	let list = new BotCommandList()
		.add("test", "a test command")
		.setLanguage("en")
		.setScope("chat")
		.add("test_en", "a test command2");
	hearGetCommands([]);
	hearSetCommands(p => { result.push(p); });
	
	await cmdUploader.upload(list);

	expect(result).toStrictEqual([{
		commands: [{
			command: "test",
			description: "a test command"
		}],
		language_code: "",
		scope: { type: "default" }
	}, {
		commands: [{
			command: "test_en",
			description: "a test command2"
		}],
		language_code: "en",
		scope: { type: "chat" }
	}
	]);
});
class CommandHandler {
	@CommandInfo("ping", "get a ping")
	public getPing() {
		return Promise.resolve(0);
	}

	@CommandInfo("rand", "get a random number")
	public getRandom() {
		return Promise.resolve(Math.random());
	}
}
test("should correctly work with decorated entities", async () => {
	let result: Record<string, any>;
	let list = new BotCommandList().implementDecorators(new CommandHandler);
	hearGetCommands([]);
	hearSetCommands(p => { result = p; });
	
	await cmdUploader.upload(list);

	expect(result).toStrictEqual({
		commands: [
			{
				command: "ping",
				description: "get a ping"
			},
			{ 
				command: "rand",
				description: "get a random number"
			},
		],
		language_code: "",
		scope: { type: "default" }
	});
});

