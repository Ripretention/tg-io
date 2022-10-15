import {IAttachment} from "../../types/IAttachment";
import {Entity} from "../Entity";

export class Attachment<TAttachment extends IAttachment> extends Entity<IAttachment & TAttachment> {
	public readonly id = this.get("file_id");
	public readonly uniqueId = this.get("file_unique_id"); 
	public type = this.get("mime_type");
	public size = this.get("file_size");
}
