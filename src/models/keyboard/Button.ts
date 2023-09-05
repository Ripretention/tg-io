import { randomInt } from "crypto";
import { IKeyboardInlineButton, IKeyboardButton } from "../../types/IKeyboard";

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
	  }
	: T;

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
		text: string;
		url?: string;
		payload?: string;
		switchQuery?: string;
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
			switch_inline_query_current_chat: this.switchCurrentChatQuery,
		};

		return Object.entries(btn)
			.filter(([_, v]) => v != null)
			.reduce(
				(acc, [key, val]) => ({ [key]: val, ...acc }),
				{}
			) as IKeyboardInlineButton;
	}
}
export class Button extends BaseButton {
	public readonly shareRequestId = randomInt(-2147483648, 2147483647);
	constructor(
		text: string,
		private readonly params: DeepPartial<IKeyboardButton> = {}
	) {
		super(text);
	}

	public toObject() {
		if (!this.params.text) {
			this.params.text = this.text;
		}

		if (
			this.params?.request_chat &&
			!this.params.request_chat?.request_id
		) {
			this.params.request_chat.request_id = this.shareRequestId;
		} else if (
			this.params?.request_user &&
			!this.params.request_user?.request_id
		) {
			this.params.request_user.request_id = this.shareRequestId;
		}

		return Object.assign({}, this.params) as IKeyboardButton;
	}
}
