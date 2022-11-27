import {IMessage} from "./IMessage";
import {IUser} from "./IUser";

export class ICallbackQuery {
	public id: string;
	public from: IUser;
	public data?: string;
	public message?: IMessage;
	public chat_instance: string;
	public game_short_name?: string;
	public inline_message_id?: string;
}
