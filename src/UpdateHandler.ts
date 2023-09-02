import { Api } from "./Api";
import { CallbackQueryContext } from "./contexts/CallbackQueryContext";
import { MessageContext } from "./contexts/MessageContext";
import { Middleware, MiddlewareToken } from "./utils/Middleware";
import { IMessage } from "./types/IMessage";
import { IUpdateResult } from "./types/IUpdate";
import { UpdateHandlerDecoratorMetadata } from "./decorators/UpdateHandlerDecorators";
import { Conversation } from "./converstations/Conversation";

type EventContexts = {
	message: MessageContext;
	callback_query: CallbackQueryContext;
};
export type TextMatch = string | string[] | RegExp;
export type UpdateHandlerFn<TUpdate> = (
	context: TUpdate,
	next: () => void
) => any;

export type UpdateHandlerErrorListener = (err: unknown) => Promise<void>;
export class UpdateHandler {
	constructor(private readonly api: Api) {}

	private contextCtorStorage: Record<
		keyof EventContexts,
		new (...args: any[]) => any
	> = {
		message: MessageContext,
		callback_query: CallbackQueryContext,
	};
	private baseHandler = new Middleware<IUpdateResult>();
	private updates: { [kind: string]: Middleware<any> } = {};

	private errorListener: UpdateHandlerErrorListener = err => {
		throw err;
	};
	public onError(listener: UpdateHandlerErrorListener) {
		this.errorListener = listener;
	}

	public async handle(update: IUpdateResult) {
		try {
			await this.handleUpdate(update);
		} catch (err) {
			await this.errorListener(err);
		}
	}
	private async handleUpdate(update: IUpdateResult) {
		let token = new MiddlewareToken();

		await this.baseHandler.handle(update, token);
		for (let updateMiddleware of Object.keys(this.updates)
			.filter(key => Object.keys(update).includes(key))
			.map(key => this.updates[key])) {
			await updateMiddleware.handle(update, token);
		}
	}

	private conversation: Conversation;
	public implementConversations() {
		this.conversation = new Conversation();
		this.onUpdate(
			"message",
			this.conversation.handle.bind(this.conversation)
		);
	}
	public implementDecorators(...decoratedHandlers: Record<string, any>[]) {
		for (let handler of decoratedHandlers) {
			let metadata: UpdateHandlerDecoratorMetadata =
				handler?.constructor?.prototype?.__tgHandlerMetadata;
			if (!metadata) continue;

			metadata.implement(this, handler);
		}
	}

	public setContext<
		TEvent extends keyof EventContexts,
		TContext extends EventContexts[TEvent],
	>(event: TEvent, ctor: new (...args: any[]) => TContext) {
		this.contextCtorStorage[event] = ctor;
	}
	public use(handler: UpdateHandlerFn<IUpdateResult>) {
		this.baseHandler.add(handler);
	}
	public onUpdate<TUpdate>(
		updateKind: string,
		handler: UpdateHandlerFn<TUpdate>,
		skipConvertingToContext = false
	) {
		if (this.updates.hasOwnProperty(updateKind)) {
			this.updates[updateKind].add(handler);
			return;
		}

		this.updates[updateKind] = new Middleware();
		this.updates[updateKind].add((upd, next) => {
			if (!upd.hasOwnProperty(updateKind)) {
				return next();
			}

			let evt =
				skipConvertingToContext ||
				!this.contextCtorStorage.hasOwnProperty(updateKind)
					? upd[updateKind]
					: new this.contextCtorStorage[updateKind](
							this.api,
							upd[updateKind],
							this.conversation
					  );

			next(evt);
		});
		this.updates[updateKind].add(handler);
	}
	public hearCallbackQuery<TContext extends CallbackQueryContext>(
		match: TextMatch,
		handler: UpdateHandlerFn<TContext>
	) {
		this.onUpdate<TContext>(
			"callback_query",
			this.hearEvent<TContext>(match, handler, "data")
		);
	}
	public hearCommand<TContext extends MessageContext>(
		match: TextMatch,
		handler: UpdateHandlerFn<TContext>
	) {
		this.onUpdate<TContext>(
			"message",
			this.hearEvent<TContext>(match, handler, "text")
		);
	}
	private hearEvent<TContext extends { match: string[] }>(
		match: TextMatch,
		handler: UpdateHandlerFn<TContext>,
		matchSouce: keyof TContext
	) {
		return (ctx: TContext, next: () => void) => {
			let content = ctx?.[matchSouce] as string;

			let isMatched =
				(typeof match === "string" && content === match) ||
				(Array.isArray(match) && match.some(t => t === content)) ||
				(match instanceof RegExp && match.test(content));
			if (isMatched) {
				ctx.match = match instanceof RegExp ? content.match(match) : [];
				return handler(ctx, next);
			}

			return next();
		};
	}
	public onMessageEvent<TContext extends MessageContext>(
		event: keyof TContext | keyof IMessage,
		handler: UpdateHandlerFn<TContext>
	) {
		this.onUpdate<TContext>("message", (upd, next) =>
			event.hasOwnProperty(event) || upd.get(event as any)
				? handler(upd, next)
				: next()
		);
	}
}
