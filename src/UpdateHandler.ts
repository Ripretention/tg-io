import {Api} from "./Api";
import {CallbackQueryContext} from "./contexts/CallbackQueryContext";
import {MessageContext} from "./contexts/MessageContext";
import {ICallbackQuery} from "./types/ICallbackQuery";
import {IMessage} from "./types/IMessage";
import {IUpdate} from "./types/IUpdate";

type EventContexts = {
	message: MessageContext,
	callback_query: CallbackQueryContext
};
type TextMatch = string | string[] | RegExp;
export type UpdateHandlerFn<TUpdate> = (context: TUpdate, next: () => void) => any;
export class UpdateHandler {
	constructor(private readonly api: Api) {}

	private contextCtorStorage: Record<keyof EventContexts, (new (...args: any[]) => any)> = {
		message: MessageContext,
		callback_query: CallbackQueryContext
	};
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

	public setContext<TEvent extends keyof EventContexts, TContext extends EventContexts[TEvent]>(
		event: TEvent, 
		ctor: new (...args: any[]) => TContext
	) {
		this.contextCtorStorage[event] = ctor;
	}
	public use(handler: UpdateHandlerFn<IUpdate>) {
		this.baseHandler = handler;
	}
	public onUpdate<TUpdate>(updateKind: string, handler: UpdateHandlerFn<TUpdate>) {
		if (!this.updates.hasOwnProperty(updateKind))
			this.updates[updateKind] = [];
		this.updates[updateKind].push((upd, next) => handler(upd[updateKind], next));
	}
	public hearCallbackQuery<TContext extends CallbackQueryContext>(match: TextMatch, handler: UpdateHandlerFn<TContext>) {
		this.onUpdate<ICallbackQuery>("callback_query", this.hearEvent(match, handler, this.contextCtorStorage.callback_query, "data"));
	}
	public hearCommand<TContext extends MessageContext>(match: TextMatch, handler: UpdateHandlerFn<TContext>) {
		this.onUpdate<IMessage>("message", this.hearEvent(match, handler, this.contextCtorStorage.message, "text"));
	}
	private hearEvent<TEvent, TContext extends { match: string[] }>(
		match: TextMatch, 
		handler: UpdateHandlerFn<TContext>, 
		ctor: new (api: Api, source: TEvent) => TContext, 
		matchSouce: keyof TEvent
	) {
		return (upd: TEvent, next: () => void) => {
			let content = upd?.[matchSouce] as string;

			let isMatched = (
				(typeof match === "string" && content === match) ||
				(Array.isArray(match) && match.some(t => t === content)) ||
				(match instanceof RegExp && match.test(content))
			);
			if (isMatched) {
				let evt = new ctor(this.api, upd);
				evt.match = match instanceof RegExp 
					? content.match(match) 
					: [];
				return handler(evt, next);
			}

			return next();
		};
	}
	public onMessageEvent(event: string, handler: UpdateHandlerFn<MessageContext>) {
		this.onUpdate<IMessage>("message", (upd, next) => upd.hasOwnProperty(event)
			? handler(new this.contextCtorStorage.message(this.api, upd), next)
			: next()
		);
	}
}

enum HandlerMiddlewareState {
	Next,
	Stop	
}
