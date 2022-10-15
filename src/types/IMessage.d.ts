import {IAudioAttachment, IDocumentAttachment, IPhotoAttachment, IVideoAttachment, IVideoNoteAttachment, IVoiceAttachment} from "./IAttachment";
import {IChat} from "./IChat";
import {IUser} from "./IUser";

export interface IMessage {
	message_id: number;
	date: number;
	text?: string;
	from?: IUser;
	chat?: IChat;
	reply_to_message?: Omit<IMessage, "reply_to_message">;

	audio?: IAudioAttachment;
	document?: IDocumentAttachment;
	video?: IVideoAttachment;
	video_note?: IVideoNoteAttachment;
	voice?: IVoiceAttachment;
	photo?: IPhotoAttachment[];
}
