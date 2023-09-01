import { Api } from "../Api";
import { Chat } from "../models/Chat";
import { IChat } from "../types/IChat";

export class ChatContext extends Chat {
	constructor(private readonly api: Api, source: IChat) {
		super(source);
	}

	public countMembers() {
		return this.execute<number>("getChatMemberCount");
	}
	public leave() {
		return this.execute<boolean>("leaveChat");
	}

	private async execute<TResult>(
		method: string,
		params?: Record<string, any>
	) {
		return (
			await this.api.callMethod<TResult>(method, {
				chat_id: this.id,
				...(params ?? {}),
			})
		).result;
	}
}
