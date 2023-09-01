import { Api } from "../Api";
import { CallbackQuery } from "../models/CallbackQuery";
import { ICallbackQuery } from "../types/ICallbackQuery";
import { filterObjectByKey } from "../utils";
import { MessageContext } from "./MessageContext";

export class CallbackQueryContext extends CallbackQuery {
	public message = new MessageContext(this.api, this.get("message"));
	public match: string[] = [];
	constructor(private readonly api: Api, source: ICallbackQuery) {
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
			show_alert: content?.url ?? true,
			cache_time: content?.cacheTime ?? 0,
			...filterObjectByKey(
				content ?? {},
				k => k !== "cacheTime" && k !== "alert"
			),
		});
	}
}
