import {IAudioAttachment} from "../../types/IAttachment";
import {Attachment} from "./Attachment";

export class Audio extends Attachment<IAudioAttachment> {
	public duration = this.get("duration");
	public title = this.get("title");	
}
