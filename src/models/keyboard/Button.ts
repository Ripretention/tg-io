import {IKeyboardInlineButton, IKeyboardButton} from "../../types/IKeyboard";
export abstract class BaseButton {
	constructor(public readonly text: string) {}
	public abstract toObject(): Record<string, any>;
}
export class InlineButton extends BaseButton {
	public readonly url: string;
	public readonly payload: string;
	public readonly switchQuery: string;
	public readonly switchCurrentChatQuery: string;

	constructor(params: {
		text: string,
		url?: string,
		payload?: string,
		switchQuery?: string,
		switchCurrentChatQuery?: string;
	}) {
		super(params.text);
		for (let [key, val] of Object.entries(params)) {
			this[key] = val;
		}
	}

	public toObject() {
		let btn: IKeyboardInlineButton = {
			text: this.text,
			callback_data: this.payload,
			url: this.url,
			switch_inline_query: this.switchQuery,
			switch_inline_query_current_chat: this.switchCurrentChatQuery
		};

		return Object.entries(btn)
			.filter(([_, v]) => v != null)
			.reduce((acc, [key, val]) => ({ [key]: val, ...acc }), {}) as IKeyboardInlineButton;
	}
}
export class Button extends BaseButton {
	constructor(
		text: string, 
		private readonly requestType?: "poll_quiz" | "poll_regular" | "location" | "contact"
	) {
		super(text);
	}

	public toObject() {
		let btn = {
			text: this.text
		};

		let type = this.requestType;
		if (type === "contact")
			btn["request_contact"] = true;
		else if (type === "location")
			btn["request_location"] = true;
		else if (type === "poll_regular")
			btn["request_poll"] = { type: "regular" };
		else if (type === "poll_quiz")
			btn["request_poll"] = { type: "quiz" };

		return btn as IKeyboardButton;
	}
}
