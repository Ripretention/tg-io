import { IKeyboardInline, IKeyboard } from "../IKeyboard";
import { IMessageEntity } from "../IMessageEntity";

export interface IBaseSendParams {
	chat_id: number | string;
	message_thread_id?: number;
	reply_to_message_id?: number;
	parse_mode?: string;
	protect_content?: boolean;
	disable_notification?: boolean;
	allow_sending_without_reply?: boolean;
	reply_markup?: IKeyboardInline | IKeyboard;
}

export interface IMessageSendParams extends IBaseSendParams {
	text: string;
	disable_web_page_preview?: boolean;
	entities?: IMessageEntity[];
}

export type InputFile = string | { file_id: string };
export type AttachmentType =
	| "photo"
	| "audio"
	| "video"
	| "document"
	| "animation"
	| "voice"
	| "video_note"
	| "media"
	| "sticker";
export interface IAttachmentSendParams extends IBaseSendParams {
	caption?: string;
	caption_entities?: IMessageEntity[];
}
