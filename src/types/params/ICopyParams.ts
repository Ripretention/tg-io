import { IKeyboard, IKeyboardInline } from "../IKeyboard";
import { IMessageEntity } from "../IMessageEntity";

export interface ICopyParams {
	chat_id: number | string;
	message_thread_id?: number;
	from_chat_id: number | string;
	message_id: number;
	parse_mode?: string;
	caption_entities?: IMessageEntity[];
	disable_notification?: boolean;
	protect_content?: boolean;
	reply_to_message_id?: number;
	allow_sending_without_reply?: boolean;
	reply_markup?: IKeyboard | IKeyboardInline;
}
