import { MessageContext } from "../contexts/MessageContext";
import { Middleware, MiddlewareToken } from "../utils";
import { ConversationAnswer } from "./ConversationAnswer";
import { checkCondition, ConversationOptions } from "./ConversationOptions";

interface ConversationContextWrapper<T> {
	ctx: T;
	ctxNext: () => void;
}

export class Conversation {
	private readonly middleware = new Middleware<
		ConversationContextWrapper<MessageContext>
	>();

	public async handle(ctx: MessageContext, next: () => void) {
		let token = new MiddlewareToken();
		await this.middleware.handle({ ctx, ctxNext: () => next() }, token);

		if (token.getState()) {
			return next();
		}
	}
	public waitAnswer(
		ctx: MessageContext,
		options?: ConversationOptions
	): Promise<ConversationAnswer> {
		return new Promise(resolve => {
			let segment = this.middleware.add(
				async ({ ctx: upd, ctxNext: updNext }, next) => {
					if (ctx.chat.id !== upd.chat.id) {
						return next();
					}

					if (
						options?.condition &&
						!checkCondition(upd, options.condition)
					) {
						if (options?.conditionFallback) {
							await options.conditionFallback(upd);
						}

						return next();
					}

					let match: string[] =
						options?.condition instanceof RegExp
							? upd.text?.match(options.condition) ?? []
							: [];

					this.middleware.remove(segment);
					return resolve(new ConversationAnswer(upd, updNext, match));
				},
				`converation msg=${ctx.id}`
			);
		});
	}
}
