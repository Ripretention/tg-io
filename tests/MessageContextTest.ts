import { MessageContext } from "../src/contexts/MessageContext";
import { Photo } from "../src/models/attachments";
import { IUpdate } from "../src/types/IUpdate";
import { ApiMock } from "./utils/ApiMock";

const apiMock = new ApiMock();
const api = apiMock.get();
const msg = new MessageContext(api, {
	date: Date.now(),
	chat: {
		id: 404,
		type: "group",
	},
	message_id: Math.random(),
});
function hearSendMethod(
	method: string,
	predicat: (p: any) => boolean,
	cb: (p?: any) => any
) {
	apiMock.addCallback(`send${method}`, params => {
		if (predicat(params)) cb(params);

		return Promise.resolve({
			ok: true,
			result: {
				message: {
					message_id: 1,
					date: Date.now(),
					text: "hello!",
				},
			},
		} as IUpdate);
	});
}

beforeEach(() => {
	apiMock.clear();
});

describe("sending text messages", () => {
	test("should set chat_id and text for a message correctly", async () => {
		let handled = false;
		hearSendMethod(
			"Message",
			params =>
				params["chat_id"] === msg.chat.id &&
				/test message/.test(params.text),
			() => {
				handled = true;
			}
		);

		await msg.sendMessage({ text: "hello, there's a test message" });

		expect(handled).toBe(true);
	});
	test("should parse single text argument correctly", async () => {
		let handled = false;
		hearSendMethod(
			"Message",
			params => /test message/.test(params.text),
			() => {
				handled = true;
			}
		);

		await msg.sendMessage("hello, there's a test message");

		expect(handled).toBe(true);
	});
	test("should reply message correctly", async () => {
		let handled = false;
		hearSendMethod(
			"Message",
			params =>
				params.reply_to_message_id === msg.id &&
				/test message/.test(params.text),
			() => {
				handled = true;
			}
		);

		await msg.replyMessage("hello, there's a test message");

		expect(handled).toBe(true);
	});
});
describe("sending attachments", () => {
	test("should parse instance (Attachment) source argument correctly", async () => {
		let fileId = null;
		hearSendMethod(
			"Photo",
			params => params.photo.file_id === "123",
			params => {
				fileId = params.photo.file_id;
			}
		);

		await msg.attach(
			"photo",
			new Photo({
				file_id: "123",
				file_unique_id: "321",
				height: 600,
				width: 600,
			})
		);

		expect(fileId).toBe("123");
	});
	test("should handle url source argument correctly", async () => {
		let expectedUrl = "https://someaudio.com/audio.mp3";
		let url = null;
		hearSendMethod(
			"Audio",
			params =>
				params.chat_id === msg.chat.id && /https/.test(params.audio),
			params => {
				url = params.audio;
			}
		);

		await msg.attach("audio", expectedUrl);

		expect(url).toBe(expectedUrl);
	});
	test("should handle caption argument correctly", async () => {
		let randomCaption = Math.random().toString();
		let caption = null;
		hearSendMethod(
			"Photo",
			params => params.caption != null,
			params => {
				caption = params.caption;
			}
		);

		await msg.sendPhoto("https://some.com/lol.png", randomCaption);

		expect(caption).toBe(randomCaption);
	});
	test("should reply an attachemnt correctly", async () => {
		let id = null;
		hearSendMethod(
			"Video",
			params => params.caption != null,
			params => {
				id = params.reply_to_message_id;
			}
		);

		await msg.replyVideo("https://some.com/lol.mp3", "test");

		expect(id).toBe(msg.id);
	});
});
