import {
	IAudioAttachment,
	IDocumentAttachment,
	IPhotoAttachment,
	IStickerAttachment,
	IVideoAttachment,
	IVideoNoteAttachment,
	IVoiceAttachment,
} from "./IAttachment";
import { IChat } from "./IChat";
import { IKeyboard, IKeyboardInline } from "./IKeyboard";
import { IMessageEntity } from "./IMessageEntity";
import { IUser } from "./IUser";

export interface IMessage {
	readonly message_id: number;
	date: number;
	text?: string;
	from?: IUser;
	chat?: IChat;
	reply_to_message?: Omit<IMessage, "reply_to_message">;
	entities?: IMessageEntity[];
	caption?: string;
	caption_entities?: string;
	reply_markup?: IKeyboardInline | IKeyboard;

	// attachments
	sticker?: IStickerAttachment;
	audio?: IAudioAttachment;
	document?: IDocumentAttachment;
	video?: IVideoAttachment;
	video_note?: IVideoNoteAttachment;
	voice?: IVoiceAttachment;
	photo?: IPhotoAttachment[];
}
