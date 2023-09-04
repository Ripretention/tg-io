import { Api } from "../Api";
import { Conversation } from "../converstations/Conversation";
import { CallbackQuery } from "../models/CallbackQuery";
import { ICallbackQuery } from "../types/ICallbackQuery";
import { MessageContext } from "./MessageContext";

export class CallbackQueryContext extends CallbackQuery {
	public message = new MessageContext(
		this.api,
		this.get("message"),
		this.conversation
	);
	public match: string[] = [];
	constructor(
		private readonly api: Api,
		source: ICallbackQuery,
		private readonly conversation?: Conversation
	) {
		super(source);
	}

	public answer(content?: {
		text?: string;
		alert?: boolean;
		url?: string;
		cacheTime?: number;
	}) {
		return this.api.callMethod("answerCallbackQuery", {
			callback_query_id: this.id,
			show_alert: content?.alert ?? false,
			cache_time: content?.cacheTime ?? 0,
			...(content ?? {}),
		});
	}
}
