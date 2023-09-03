import { MessageContext } from "../contexts/MessageContext";

export class ConversationAnswer {
	constructor(
		public readonly ctx: MessageContext,
		public readonly next: () => void,
		match: string[]
	) {
		ctx.match = match;
	}

	public get asMatch() {
		return this.ctx.match ?? [];
	}
	public get asText() {
		return this.ctx.text;
	}
	public get asNumber() {
		return Number(this.ctx);
	}

	public toString() {
		return this.ctx.text;
	}
}
