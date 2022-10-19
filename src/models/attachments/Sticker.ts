import {IStickerAttachment} from "../../types/IAttachment";
import {Attachment} from "./Attachment";
import {Photo} from "./Photo";

export class Sticker extends Attachment<IStickerAttachment> {
	public readonly type = this.get("type");
	public readonly isAnimated = this.get("is_animated");
	public readonly isVideo = this.get("is_video");
	public readonly name = this.get("set_name"); 
	public readonly emoji = this.get("emoji");
	public thumb = this.construct("thumb", Photo);
}
