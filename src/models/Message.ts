import {IMessage} from "../types/IMessage";
import {Audio, Document, Photo, Video, VideoNote, Voice} from "./attachments";
import {Chat} from "./Chat";
import {Entity} from "./Entity";
import {User} from "./User";

export class Message extends Entity<IMessage> {
	public readonly id = this.get("message_id");	
	public readonly date = this.get("date");
	public readonly sender = this.construct("from", User);
	public readonly chat = this.construct("chat", Chat);
	public readonly repliedMessage = this.construct("reply_to_message", Message);
	public text = this.get("text") ?? this.get("caption");

	public entities = this.get("entities");
	public audio = this.construct("audio", Audio);
	public voice = this.construct("voice", Voice);
	public video = this.construct("video", Video);
	public videoNote = this.construct("video_note", VideoNote);
	public document = this.construct("document", Document);
	public photo = this.get("photo")
		? this.get("photo").map(photo => new Photo(photo))
		: []; 

	public get hasAttachments() {
		return [
			this.audio, 
			this.video, 
			this.voice, 
			this.videoNote, 
			this.document, 
			this.photo.length 
				? this.photo 
				: null
		].some(attachment => attachment != null);
	}
}
