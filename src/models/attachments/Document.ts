import {IDocumentAttachment} from "../../types/IAttachment";
import {Attachment} from "./Attachment";
import {Photo} from "./Photo";

export class Document extends Attachment<IDocumentAttachment> {
	public thumb = this.get("thumb")
		? new Photo(this.get("thumb"))
		: null;
}
