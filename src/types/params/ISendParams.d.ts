import {IInlineKeyboard, IKeyboard} from "../IKeyboard";
import {IMessageEntity} from "../IMessageEntity";

export interface IBaseSendParams {
	chat_id: number | string;
	reply_to_message_id?: number;
	parse_mode?: string;
	protect_content?: boolean;
	disable_notification?: boolean;
	allow_sending_without_reply?: boolean;
	reply_markup?: IInlineKeyboard | IKeyboard; 
}

export interface IMessageSendParams extends IBaseSendParams {
	text: string;
	entities?: IMessageEntity[];
}

export type InputFile = string | { file_id: string };
export type AttachmentTypes = 
	"photo" | 
	"audio" |
	"video" |
	"document" |
	"animation" |
	"voice" | 
	"video_note" |
	"media" |
	"sticker";
export type AttachmentSendParams<T extends AttachmentTypes> = { 
	[K in T]: InputFile 
} & IBaseSendParams;
