import {IKeyboardInlineButton, IKeyboardButton} from "../types/IKeyboard";
import {IMessageSendParams} from "../types/params/ISendParams";

abstract class BaseButton {
	constructor(public readonly text: string) {}
	public abstract toObject(): Record<string, any>;
}
abstract class BaseKeyboardBuilder<TButton extends BaseButton> {
	protected buttons: TButton[][] = [];

	public add(btn: TButton) {
		let lastRow = this.buttons.length-1;
		if (!this.buttons[lastRow] || this.buttons[lastRow].length >= 8) {
			this.wrap();
			lastRow++;
		}

		this.buttons[lastRow].push(btn);
		return this;
	}
	public wrap() {
		this.buttons.push([]);
		return this;
	}
	public clear() {
		this.buttons = [];
	}
	public abstract createButton(...args: any[]): this;
	public abstract build(): Pick<IMessageSendParams, "reply_markup">;
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
export class InlineKeyboardBuilder extends BaseKeyboardBuilder<InlineButton> {
	public createButton(...args: ConstructorParameters<typeof InlineButton>) {
		return this.add(new InlineButton(...args));
	}
	public build() {
		return {
			reply_markup: {
				inline_keyboard: this.buttons.map(row => row.map(btn => btn.toObject()))
			}
		};
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
export class KeyboardBuilder extends BaseKeyboardBuilder<Button> {
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

	public createButton(...args: ConstructorParameters<typeof Button>) {
		return this.add(new Button(...args));
	}
	public build() {
		return {
			reply_markup: {
				keyboard: this.buttons.map(row => row.map(btn => btn.toObject())),
				...this.additionalOptions
			}
		};
	}

	public static remove(remove = true, selective = false) {
		return JSON.stringify({
			remove_keyboard: remove,
			selective
		});
	}
}
