import { IVoiceAttachment } from "../../types/IAttachment";
import { Attachment } from "./Attachment";

export class Voice extends Attachment<IVoiceAttachment> {
	public duration = this.get("duration");
}
