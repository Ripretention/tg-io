import {
	Button,
	InlineButton,
	InlineKeyboardBuilder,
	KeyboardBuilder,
} from "../src/models/keyboard";
import { IKeyboardInlineButton, IKeyboardButton } from "../src/types/IKeyboard";

describe("Inline Keyboard Builder", () => {
	const keyboard = new InlineKeyboardBuilder();
	afterEach(keyboard.clear.bind(keyboard));

	test("should build keyboard with every type of inline buttons", () => {
		let cbBtn = new InlineButton({ text: "hello", payload: "some_info" });
		keyboard.add(cbBtn);
		let urlBtn = new InlineButton({
			text: "click me",
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		});
		keyboard.add(urlBtn);
		let chatSelectBtn = new InlineButton({
			text: "select chat",
			switchQuery: "help",
		});
		keyboard.add(chatSelectBtn);
		let currentChatQueryBtn = new InlineButton({
			text: "don't click me",
			switchCurrentChatQuery: "what did i tell u?",
		});
		keyboard.add(currentChatQueryBtn);

		let { reply_markup: result } = keyboard.build();

		expect(result).toStrictEqual({
			inline_keyboard: [
				[
					{ text: cbBtn.text, callback_data: cbBtn.payload },
					{ text: urlBtn.text, url: urlBtn.url },
					{
						text: chatSelectBtn.text,
						switch_inline_query: chatSelectBtn.switchQuery,
					},
					{
						text: currentChatQueryBtn.text,
						switch_inline_query_current_chat:
							currentChatQueryBtn.switchCurrentChatQuery,
					},
				] as Partial<IKeyboardInlineButton>[],
			],
		});
	});
	test("should automatically wrap the keyabord after reaching more than eight buttons", () => {
		for (let i = 0; i < 10; i++)
			keyboard.createButton({ text: "btn", payload: "64" });

		let result = keyboard.build()["reply_markup"]["inline_keyboard"];

		expect(result[0].length).toBe(8);
		expect(result.length).toBe(2);
	});
});
describe("Keyboard Builder", () => {
	const keyboard = new KeyboardBuilder();
	afterEach(keyboard.clear.bind(keyboard));

	test("should build keyboard with every type of buttons", () => {
		let textBtn = new Button("text");
		let contactBtn = new Button("text", { request_contact: true });
		let locationBtn = new Button("text", { request_location: true });
		let pollQuizBtn = new Button("text", {
			request_poll: { type: "quiz" },
		});
		let pollRegularBtn = new Button("text", {
			request_poll: { type: "regular" },
		});
		let shareUserBtn = new Button("text", {
			request_user: { user_is_bot: true },
		});
		let shareChatBtn = new Button("text", {
			request_chat: { bot_is_member: true },
		});

		let { reply_markup: result } = keyboard
			.add(textBtn)
			.add(contactBtn)
			.add(locationBtn)
			.add(pollQuizBtn)
			.add(pollRegularBtn)
			.add(shareUserBtn)
			.add(shareChatBtn)
			.build();

		expect(result).toStrictEqual({
			keyboard: [
				[
					{},
					{ request_contact: true },
					{ request_location: true },
					{ request_poll: { type: "quiz" } },
					{ request_poll: { type: "regular" } },
					{
						request_user: {
							request_id: shareUserBtn.shareRequestId,
							user_is_bot: true,
						},
					},
					{
						request_chat: {
							request_id: shareChatBtn.shareRequestId,
							bot_is_member: true,
						},
					},
				].map(o => ({
					text: "text",
					...o,
				})) as Partial<IKeyboardButton>[],
			],
		});
	});
	test("should build keyboard with complex options", () => {
		keyboard
			.setOneTime()
			.setResize()
			.setSelective()
			.setPlaceholder("hello");

		let { reply_markup: result } = keyboard.build();

		expect(result).toStrictEqual({
			keyboard: [],
			one_time_keyboard: true,
			resize_keyboard: true,
			selective: true,
			input_field_placeholder: "hello",
		});
	});
});
