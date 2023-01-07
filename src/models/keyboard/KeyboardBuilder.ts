import {Button, BaseButton, InlineButton} from "./Button";
import {IKeyboardButton} from "../../types/IKeyboard";
import {IMessageSendParams} from "../../types/params/ISendParams";

export abstract class BaseKeyboardBuilder<TButton extends BaseButton> {
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
