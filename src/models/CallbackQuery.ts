import {ICallbackQuery} from "../types/ICallbackQuery";
import {Entity} from "./Entity";
import {Message} from "./Message";
import {User} from "./User";

export class CallbackQuery extends Entity<ICallbackQuery> {
	public id = this.get("id");
	public data = this.get("data");
	public sender = this.construct("from", User);
	public chatInstance = this.get("chat_instance");
	public message = this.construct("message", Message);
	public inlineMsgId = this.get("inline_message_id");
	public gameShortname = this.get("game_short_name");
}
