import {IVideoNoteAttachment} from "../../types/IAttachment";
import {Attachment} from "./Attachment";
import {Photo} from "./Photo";

export class VideoNote extends Attachment<IVideoNoteAttachment> {
	public length = this.get("length");
	public duration = this.get("duration");
	public thumb = this.construct("thumb", Photo);
}
