import {MessageContext} from "../src/contexts/MessageContext";
import {Photo} from "../src/models/attachments";
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

beforeEach(() => {
	apiMock.clear();
});

describe("send text message", () => {
	test("should send message by params argument", async () => {
		let handled = false;
		apiMock.addCallback("sendMessage", params => {
			if (params["chat_id"] === msg.chat.id && /test message/.test(params.text))
				handled = true;
		});

		await msg.sendMessage({ text: "hello, there's a test message" });

		expect(handled).toBe(true);
	});
	test("should send message by string argument", async () => {
		let handled = false;
		apiMock.addCallback("sendMessage", params => {
			if (/test message/.test(params.text))
				handled = true;
		});

		await msg.sendMessage("hello, there's a test message");

		expect(handled).toBe(true);
	});
	test("should send message with reference (reply) on current message", async () => {
		let handled = false;
		apiMock.addCallback("sendMessage", params => {
			if (params.reply_to_message_id === msg.id && /test message/.test(params.text))
				handled = true;
		});

		await msg.replyMessage("hello, there's a test message");

		expect(handled).toBe(true);
	});
});
describe("send attachment (attach())", () => {
	test("should send attachment by attachment class", async () => {
		let handled = false;
		apiMock.addCallback("sendPhoto", params => {
			if (params.photo.file_id === "123")
				handled = true;
		});

		await msg.attach("photo", new Photo({
			file_id: "123",
			file_unique_id: "321",
			height: 600,
			width: 600
		}));

		expect(handled).toBe(true);
	});
	test("should send attachment by file_id", async () => {
		let handled = false;
		apiMock.addCallback("sendDocument", params => {
			if (params.document.file_id === "id")
				handled = true;
		});

		await msg.attach("document", {
			file_id: "id"
		});

		expect(handled).toBe(true);
	});
	test("should send attachment by url", async () => {
		let handled = false;
		apiMock.addCallback("sendAudio", params => {
			if (params.chat_id === msg.chat.id && /https/.test(params.audio))
				handled = true;
		});

		await msg.attach("audio", "https://someaudio.com/audio.mp3");

		expect(handled).toBe(true);
	});
});
