import { MessageContext } from "../contexts/MessageContext";
import { Middleware, MiddlewareToken } from "../utils";
import { ConversationAnswer } from "./ConversationAnswer";
import { checkCondition, ConversationOptions } from "./ConversationOptions";

export class Conversation {
	private readonly middleware = new Middleware<MessageContext>();

	public handle(ctx: MessageContext) {
		let token = new MiddlewareToken();
		return this.middleware.handle(ctx, token);
	}
	public waitAnswer(
		ctx: MessageContext,
		options?: ConversationOptions
	): Promise<ConversationAnswer> {
		return new Promise(resolve => {
			let segment = this.middleware.add(async (upd, next) => {
				if (ctx.chat.id !== upd.chat.id) {
					return next();
				}

				let match: string[] =
					options?.condition instanceof RegExp
						? ctx.text.match(options.condition)
						: [];
				if (
					options.condition &&
					!checkCondition(upd, options.condition)
				) {
					if (options?.conditionFallback) {
						await options.conditionFallback(upd);
					}
					return next();
				}

				this.middleware.remove(segment);
				resolve(new ConversationAnswer(upd, next, match));
			});
		});
	}
}
