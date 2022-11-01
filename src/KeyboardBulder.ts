import {IKeyboardButton} from "./types/IKeyboard";

export abstract class BaseButton {
	constructor(public readonly text: string) {}
	public abstract toObject(): Record<string, any>;
}
export abstract class BaseKeyboardBuilder<TButton extends BaseButton> {
	protected buttons: TButton[][] = [];

	public add(btn: TButton) {
		let lastRow = Math.min(this.buttons.length-1, 0);
		if (!this.buttons[lastRow])
			this.buttons[lastRow] = [];
		this.buttons[lastRow].push(btn);

		return this;
	}
	public wrap() {
		this.buttons.push([]);
		return this;
	}
	public abstract build(): string;
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
		let btn = {
			text: this.text,
			callback_data: this.payload,
			url: this.url,
			switch_inline_query: this.switchQuery,
			switch_inline_query_current_chat: this.switchCurrentChatQuery
		};

		return Object.entries(btn)
			.filter(([_, v]) => v != null)
			.reduce((acc, [key, val]) => ({ [key]: val, ...acc }), {});
	}
}
export class InlineKeyboardBuilder extends BaseKeyboardBuilder<InlineButton> {
	public build(): string {
		return JSON.stringify({
			inline_keyboard: this.buttons.map(row => row.map(btn => btn.toObject()))
		});
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

		return btn;
	}
}
export class KeyboardBuilderBuilder extends BaseKeyboardBuilder<Button> {
	private additionalOptions: Partial<IKeyboardButton> = {};
	public setResize(state = true) {
		this.additionalOptions["resize_keyboard"] = state;
		return this;
	}
	public setOneTime(state = true) {
		this.additionalOptions["one_time_keyboard"] = state;
		return this;
	}
	public setSelective(state = true) {
		this.additionalOptions["selective"] = state;
		return this;
	}
	public setPlaceholder(text: string) {
		this.additionalOptions["input_field_placeholder"] = text.slice(0, 63);
		return this;
	}

	public build(): string {
		return JSON.stringify({
			keyboard: this.buttons.map(row => row.map(btn => btn.toObject())),
			...this.additionalOptions
		});
	}
}
