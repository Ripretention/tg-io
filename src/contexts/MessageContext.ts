import {Api} from "../Api";
import {Attachment} from "../models/attachments";
import {Message} from "../models/Message";
import {IMessage} from "../types/IMessage";
import {AttachmentSendParams, AttachmentTypes, IBaseSendParams, InputFile} from "../types/ISendParams";
import {IUpdateCollection} from "../types/IUpdate";
import {ObjectUtils, StringUtils} from "../Utils";

type SendMessageParams = string | { text: string } & Partial<IBaseSendParams>;
type SendAttachmentParams<TAttachment extends AttachmentTypes> = AttachmentSendParams<TAttachment> | InputFile | Attachment<any>;
export class MessageContext extends Message {
	public match: string[] = [];
	constructor(private readonly api: Api, source: IMessage) {
		super(source);
	}

	public replyMessage(params: SendMessageParams): Promise<IUpdateCollection> {
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
	private send(method: string, params: Partial<IBaseSendParams>) {
		params.chat_id = this.chat.id;
		return this.api.callMethod(`send${StringUtils.capitalizeFirst(method)}`, params);
	}
}
