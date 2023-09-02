import { MessageContext } from "../contexts/MessageContext";

export interface ConversationOptions {
	/**
	 * Condition on text of message or predicate*/
	condition?: ConversationCondition;
	conditionFallback?: (ctx: MessageContext) => Promise<unknown>;
}
export type ConversationCondition =
	| string
	| string[]
	| RegExp
	| ((ctx: MessageContext) => boolean);

export function checkCondition(
	ctx: MessageContext,
	condition: ConversationCondition
) {
	return [
		typeof condition === "string" && condition === ctx.text,
		Array.isArray(condition) && condition.includes(ctx.text),
		typeof condition === "function" && condition(ctx),
		condition instanceof RegExp && condition.test(ctx.text),
	].some(x => x);
}
