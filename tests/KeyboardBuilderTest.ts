import {Button, InlineButton, InlineKeyboardBuilder, KeyboardBuilder} from "../src/KeyboardBuilder";
import {IInlineKeyboardButton, IKeyboardButton} from "../src/types/IKeyboard";

describe("Inline Keyboard Builder", () => {
	const keyboard = new InlineKeyboardBuilder();
	afterEach(keyboard.clear.bind(keyboard));

	test("should return keyboard with every possible inline button", () => {
		let cbBtn = new InlineButton({ text: "hello", payload: "some_info" });
		keyboard.add(cbBtn);
		let urlBtn = new InlineButton({ text: "click me", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
		keyboard.add(urlBtn);
		let chatSelectBtn = new InlineButton({ text: "select chat", switchQuery: "help" });
		keyboard.add(chatSelectBtn);
		let currentChatQueryBtn = new InlineButton({ text: "don't click me", switchCurrentChatQuery: "what did i tell u?" });
		keyboard.add(currentChatQueryBtn);

		let result = keyboard.build();

		expect(JSON.parse(result)).toStrictEqual({
			inline_keyboard: [
				[
					{ text: cbBtn.text, callback_data: cbBtn.payload },
					{ text: urlBtn.text, url: urlBtn.url },
					{ text: chatSelectBtn.text, switch_inline_query: chatSelectBtn.switchQuery },
					{ text: currentChatQueryBtn.text, switch_inline_query_current_chat: currentChatQueryBtn.switchCurrentChatQuery }
				] as Partial<IInlineKeyboardButton>[]
			]
		});
	});
	test("should automatically wrap the keyabord after reaching more than eight buttons", () => {
		for (let i = 0; i < 10; i++)
			keyboard.createButton({ text: "btn", payload: "64" });

		let result = JSON.parse(keyboard.build())["inline_keyboard"];

		expect(result[0].length).toBe(8);
		expect(result.length).toBe(2);
	});
});
describe("Keyboard Builder", () => {
	const keyboard = new KeyboardBuilder();
	afterEach(keyboard.clear.bind(keyboard));

	test("should return keyboard with every possible button", () => {
		let textBtn = new Button("text");
		let contactBtn = new Button("text", "contact");
		let locationBtn = new Button("text", "location"); 
		let pollQuizBtn = new Button("text", "poll_quiz"); 
		let pollRegularBtn = new Button("text", "poll_regular"); 

		let result = keyboard
			.add(textBtn)
			.add(contactBtn)
			.add(locationBtn)
			.add(pollQuizBtn)
			.add(pollRegularBtn)
			.build();

		expect(JSON.parse(result)).toStrictEqual({
			keyboard: [
				[
					{},
					{ request_contact: true },
					{ request_location: true },
					{ request_poll: { type: "quiz" } },
					{ request_poll: { type: "regular" } }
				].map(o => ({ text: "text", ...o })) as Partial<IKeyboardButton>[]
			]
		});
	});
	test("should return keyboard with every possible options", () => {
		keyboard
			.setOneTime()
			.setResize()
			.setSelective()
			.setPlaceholder("hello");

		let result = keyboard.build();

		expect(JSON.parse(result)).toStrictEqual({
			keyboard: [],
			one_time_keyboard: true,
			resize_keyboard: true,
			selective: true,
			input_field_placeholder: "hello"
		});
	});
});
