import { MessageContext } from "../contexts/MessageContext";

export class ConversationAnswer {
	constructor(
		public readonly ctx: MessageContext,
		match: string[]
	) {
		ctx.match = match;
	}

	public match() {
		return this.ctx.match ?? [];
	}
	public toString() {
		return this.ctx.text;
	}
	public toNumber() {
		return Number(this.ctx);
	}
}
