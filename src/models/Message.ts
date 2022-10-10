import {IMessage} from "../types/IMessage";
import {Chat} from "./Chat";
import {Entity} from "./Entity";
import {User} from "./User";

export class Message extends Entity<IMessage> {
	public readonly id = this.get("message_id");	
	public readonly date = this.get("date");
	public readonly sender = this.get("from") 
		? new User(this.get("from")) 
		: null;
	public readonly chat = this.get("chat") 
		? new Chat(this.get("chat")) 
		: null;
	public readonly replyMessage = this.get("reply_to_message")
		? new Message(this.get("reply_to_message"))
		: null; 
	public text = this.get("text");
}
