import {Api} from "../Api";
import {Chat} from "../models/Chat";
import {IChat} from "../types/IChat";

export class ChatContext extends Chat {
	constructor(private readonly api: Api, source: IChat) {
		super(source);
	}

	public countMembers() {
		return this.execute("getChatMemberCount");
	}
	public leave() {
		return this.execute("leaveChat");
	}

	private execute(method: string, params?: Record<string, any>) {
		return this.api.callMethod(method, {
			chat_id: this.id,
			...(params ?? {})
		});
	}
}
