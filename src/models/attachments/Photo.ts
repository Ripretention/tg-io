import { IPhotoAttachment } from "../../types/IAttachment";
import { Attachment } from "./Attachment";

export class Photo extends Attachment<IPhotoAttachment> {
	public width = this.get("width");
	public height = this.get("height");
}
