import {IVideoNoteAttachment} from "../../types/IAttachment";
import {Attachment} from "./Attachment";
import {Photo} from "./Photo";

export class VideoNote extends Attachment<IVideoNoteAttachment> {
	public length = this.get("length");
	public duration = this.get("duration");
	public thumb = this.get("thumb")
		? new Photo(this.get("thumb"))
		: null;
}
