import {MessageContext} from "../src/contexts/MessageContext";
import {Photo} from "../src/models/attachments";
import {IUpdate} from "../src/types/IUpdate";
import {ApiMock} from "./utils/ApiMock";

const apiMock = new ApiMock();
const api = apiMock.get();
const msg = new MessageContext(api, {
	date: Date.now(),
	chat: {
		id: 404,
		type: "group"
	},
	message_id: Math.random()
});
function hearSendMethod(method: string, predicat: (p: any) => boolean, cb: () => any) {
	apiMock.addCallback(`send${method}`, params => {
		if (predicat(params))
			cb();

		return Promise.resolve({ 
			ok: true, 
			result: { 
				message: {
					message_id: 1,
					date: Date.now(),
					text: "hello!"
				}
			}
		} as IUpdate);
	});
}

beforeEach(() => {
	apiMock.clear();
});

describe("send text message", () => {
	test("should send message by params argument", async () => {
		let handled = false;
		hearSendMethod(
			"Message", 
			params => params["chat_id"] === msg.chat.id && /test message/.test(params.text),
			() => { handled = true; }
		);

		await msg.sendMessage({ text: "hello, there's a test message" });

		expect(handled).toBe(true);
	});
	test("should send message by string argument", async () => {
		let handled = false;
		hearSendMethod(
			"Message", 
			params => /test message/.test(params.text),
			() => { handled = true; }
		);

		await msg.sendMessage("hello, there's a test message");

		expect(handled).toBe(true);
	});
	test("should send message with reference (reply) on current message", async () => {
		let handled = false;
		hearSendMethod(
			"Message", 
			params => params.reply_to_message_id === msg.id && /test message/.test(params.text),
			() => { handled = true; }
		);

		await msg.replyMessage("hello, there's a test message");

		expect(handled).toBe(true);
	});
});
describe("send attachment (attach())", () => {
	test("should send attachment by attachment class", async () => {
		let handled = false;
		hearSendMethod(
			"Photo", 
			params => params.photo.file_id === "123",
			() => { handled = true; }
		);

		await msg.attach("photo", new Photo({
			file_id: "123",
			file_unique_id: "321",
			height: 600,
			width: 600
		}));

		expect(handled).toBe(true);
	});
	test("should send attachment by url", async () => {
		let handled = false;
		hearSendMethod(
			"Audio", 
			params => params.chat_id === msg.chat.id && /https/.test(params.audio),
			() => { handled = true; }
		);

		await msg.attach("audio", "https://someaudio.com/audio.mp3");

		expect(handled).toBe(true);
	});
});
