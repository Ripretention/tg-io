import {IAudioAttachment, IDocumentAttachment, IPhotoAttachment, IVideoAttachment, IVideoNoteAttachment, IVoiceAttachment} from "./IAttachment";
import {IChat} from "./IChat";
import {IMessageEntity} from "./IMessageEntity";
import {IUser} from "./IUser";

export interface IMessage {
	readonly message_id: number;
	date: number;
	text?: string;
	from?: IUser;
	chat?: IChat;
	reply_to_message?: Omit<IMessage, "reply_to_message">;

	caption?: string;
	entities?: IMessageEntity[];
	audio?: IAudioAttachment;
	document?: IDocumentAttachment;
	video?: IVideoAttachment;
	video_note?: IVideoNoteAttachment;
	voice?: IVoiceAttachment;
	photo?: IPhotoAttachment[];
}
