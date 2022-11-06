import {Api} from "./Api";
import {CallbackQueryContext} from "./contexts/CallbackQueryContext";
import {MessageContext} from "./contexts/MessageContext";
import {ICallbackQuery} from "./types/ICallbackQuery";
import {IMessage} from "./types/IMessage";
import {IUpdate} from "./types/IUpdate";

type TextMatch = string | string[] | RegExp;
export type UpdateHandlerFn<TUpdate> = (context: TUpdate, next: () => void) => any;
export class UpdateHandler {
	constructor(private readonly api: Api) {}

	private baseHandler: UpdateHandlerFn<IUpdate> = null;
	private updates: { [kind: string]: UpdateHandlerFn<any>[] } = {};

	public async handle(update: IUpdate) {
		let middlewareState = HandlerMiddlewareState.Next;
		let nextMiddlewareFn = () => { 
			middlewareState = HandlerMiddlewareState.Next; 
		};

		await this?.baseHandler?.(update, nextMiddlewareFn);
		if (middlewareState !== HandlerMiddlewareState.Next)
			return;

		for (let updateHandler of Object.entries(this.updates)
			.filter(([key]) => Object.keys(update).includes(key))
			.flatMap(([_, body]) => body)
		) {
			if (middlewareState === HandlerMiddlewareState.Next) {
				middlewareState = HandlerMiddlewareState.Stop;
				await updateHandler(update, nextMiddlewareFn);
				continue;
			}
			break;
		}
	}

	public use(handler: UpdateHandlerFn<IUpdate>) {
		this.baseHandler = handler;
	}
	public onUpdate<TUpdate>(updateKind: string, handler: UpdateHandlerFn<TUpdate>) {
		if (!this.updates.hasOwnProperty(updateKind))
			this.updates[updateKind] = [];
		this.updates[updateKind].push((upd, next) => handler(upd[updateKind], next));
	}
	public hearCallbackQuery(match: TextMatch, handler: UpdateHandlerFn<CallbackQueryContext>) {
		this.onUpdate<ICallbackQuery>("callback_query", (upd, next) => {
			let { data } = upd ?? {};

			if (this.testTextMatch(data, match)) {
				let ctx = new CallbackQueryContext(this.api, upd);
				ctx.match = match instanceof RegExp 
					? data.match(match) 
					: [];
				return handler(ctx, next);
			}

			return next();
		});
	}
	public hearCommand(match: TextMatch, handler: UpdateHandlerFn<MessageContext>) {
		this.onUpdate<IMessage>("message", (upd, next) => {
			let { text } = upd ?? {};

			if (this.testTextMatch(text, match)) {
				let msg = new MessageContext(this.api, upd);
				msg.match = match instanceof RegExp 
					? text.match(match) 
					: [];
				return handler(msg, next);
			}

			return next();
		});
	}
	private testTextMatch(text: string, match: TextMatch) {
		return (
			(typeof match === "string" && text === match) ||
			(Array.isArray(match) && match.some(t => t === text)) ||
			(match instanceof RegExp && match.test(text))
		);
	}
	public onMessageEvent(event: string, handler: UpdateHandlerFn<MessageContext>) {
		this.onUpdate<IMessage>("message", (upd, next) => upd.hasOwnProperty(event)
			? handler(new MessageContext(this.api, upd), next)
			: next()
		);
	}
}

enum HandlerMiddlewareState {
	Next,
	Stop	
}
