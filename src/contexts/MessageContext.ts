import {Api} from "../Api";
import {Attachment} from "../models/attachments";
import {Message} from "../models/Message";
import {IMessage} from "../types/IMessage";
import {AttachmentSendParams, AttachmentTypes, IBaseSendParams, InputFile} from "../types/params/ISendParams";
import {IUpdate} from "../types/IUpdate";
import {ObjectUtils, StringUtils} from "../Utils";
import {ICaptionEditParams, ITextEditParams} from "../types/params/IEditParams";

type SendMessageParams = string | { text: string } & Partial<IBaseSendParams>;
type SendAttachmentParams<TAttachment extends AttachmentTypes> = AttachmentSendParams<TAttachment> | InputFile | Attachment<any>;
export class MessageContext extends Message {
	public match: string[] = [];
	constructor(private readonly api: Api, source: IMessage) {
		super(source);
	}

	public editText(text: string = this.text, params?: ITextEditParams | ICaptionEditParams) {
		if (!this.chat)
			throw new Error("delete message is supported only in chats");

		let isCaptionEdit = (params && params.message_id) || this.hasAttachments;
		params = {
			chat_id: this.chat.id,
			...(isCaptionEdit 
				? {
					caption: text
				}
				: { text }
			),
			...(params ?? {})
		};

		return this.api.callMethod(isCaptionEdit 
			? "editMessageCaption" 
			: "editMessageText",
		params);
	}
	public delete(msgId = this.id) {
		if (!this.chat)
			throw new Error("delete message is supported only in chats");

		let params = {
			message_id: msgId,
			chat_id: this.chat.id
		};

		return this.api.callMethod("deleteMessage", params);
	}

	public replyMessage(params: SendMessageParams) {
		params = typeof params === "string" 
			? { text: params } 
			: params;
		
		return this.reply("message", params);
	}
	public sendMessage(params: SendMessageParams) {	
		params = typeof params === "string" 
			? { text: params } 
			: params;

		return this.send("message", params);
	}

	public attach<TAttachmentType extends AttachmentTypes>(
		method: TAttachmentType, 
		params: SendAttachmentParams<TAttachmentType> 
	) {
		if (typeof params === "string")
			params = { 
				[method]: (/^http/i.test(params) 
					? params 
					: { file_id: params }
				)
			} as AttachmentSendParams<TAttachmentType>;
		else if (params instanceof Attachment)
			params = {
				[method]: {
					file_id: params.id
				}
			} as AttachmentSendParams<TAttachmentType>;
		else if (params.hasOwnProperty("file_id"))
			params = {
				[method]: {
					file_id: params["file_id"],
				},
				...(ObjectUtils.filterObjectByKey(params, k => k !== "file_id"))
			} as AttachmentSendParams<TAttachmentType>;

		return this.send(method, params as AttachmentSendParams<TAttachmentType>);
	}
	private reply(method: string, params: Partial<IBaseSendParams>) {
		params.reply_to_message_id = this.id;
		return this.send(method, params);
	}
	private async send(method: string, params: Partial<IBaseSendParams>) {
		params.chat_id = this.chat.id;
		let { result: response } = await this.api.callMethod<IUpdate>(`send${StringUtils.capitalizeFirst(method)}`, params);
		return new Message(response.message);
	}
}
