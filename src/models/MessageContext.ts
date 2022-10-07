import {Api} from "../Api";
import {IMessage} from "../types/IMessage";
import {Entity} from "./Entity";

export class MessageContext extends Entity<IMessage> {
	constructor(private readonly api: Api, source: IMessage) {
		super(source);
	}

	public readonly id = this.get("message_id");	
	public readonly date = this.get("date");
	public text = this.get("text");
}
