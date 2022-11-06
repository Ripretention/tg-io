import {Api} from "../Api";
import {CallbackQuery} from "../models/CallbackQuery";
import {ICallbackQuery} from "../types/ICallbackQuery";
import {MessageContext} from "./MessageContext";

export class CallbackQueryContext extends CallbackQuery {
	public message = new MessageContext(this.api, this.get("message"));
	public match: string[] = [];
	constructor(private readonly api: Api, source: ICallbackQuery) {
		super(source);
	}
}
