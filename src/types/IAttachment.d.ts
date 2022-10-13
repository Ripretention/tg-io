export interface IAttachment {
	readonly file_id: string;
	readonly file_unique_id: string;
	file_size?: number;
	mime_type?: string;
}

export interface IPhotoAttachment extends Omit<IAttachment, "mime_type"> {
	width: number;
	height: number;
}

export interface IAudioAttachment extends IAttachment {
	duration: number;
	title?: string;
	performer?: string;
	file_name?: string;
}

export interface IDocumentAttachment extends IAttachment {
	thumb?: IPhotoAttachment;
}

export interface IVideoAttachment extends IPhotoAttachment, IAttachment {
	duration: number;
	thumb?: IPhotoAttachment;
}

export interface IVideoNoteAttachment extends IAttachment {
	duration: number;
	length: number;
	thumb?: IPhotoAttachment;
}

export interface IVideoAttachment extends IAttachment {
	duration: number;
	thumb?: IPhotoAttachment;
}
