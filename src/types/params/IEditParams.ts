import { IAttachment } from "../IAttachment";
import { IKeyboard, IKeyboardInline } from "../IKeyboard";
import { IMessageEntity } from "../IMessageEntity";

export interface IBaseEditParams {
	chat_id: string | number;
	message_id?: number;
	inline_message_id?: number;
	reply_markup?: IKeyboardInline | IKeyboard;
}

export interface ITextEditParams extends IBaseEditParams {
	text: string;
	parse_mode?: string;
	entities?: IMessageEntity[];
}
export interface ICaptionEditParams extends IBaseEditParams {
	caption: string;
	parse_mode?: string;
	caption_entities?: IMessageEntity[];
}
export interface IMediaEditParams extends IBaseEditParams {
	media: IAttachment;
}
