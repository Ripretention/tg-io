import { IVideoAttachment } from "../../types/IAttachment";
import { Attachment } from "./Attachment";
import { Photo } from "./Photo";

export class Video extends Attachment<IVideoAttachment> {
	public duration = this.get("duration");
	public thumb = this.construct("thumb", Photo);
}
