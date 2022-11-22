import {Api} from "../Api";
import {Attachment} from "../models/attachments";
import {Message} from "../models/Message";
import {IMessage} from "../types/IMessage";
import {AttachmentType, IAttachmentSendParams, IBaseSendParams} from "../types/params/ISendParams";
import {IUpdateResult} from "../types/IUpdate";
import {StringUtils} from "../Utils";
import {ICaptionEditParams, ITextEditParams} from "../types/params/IEditParams";
import {ChatContext} from "./ChatContext";
import {ReadStream} from "fs";

type SendMessageParams = string | { text: string } & Partial<IBaseSendParams>;
export class MessageContext extends Message {
	public match: string[] = [];
	public chat = new ChatContext(this.api, this.get("chat"));
	constructor(private readonly api: Api, source: IMessage) {
		super(source);
	}

	public pin(id = this.id, disableNotification = true) {
		return this.execute<boolean>("pinChatMessage", {
			message_id: id,
			disable_notification: disableNotification
		});
	}
	public unpin(id = this.id) {
		return this.execute<boolean>("unpinChatMessage", {
			message_id: id
		});
	}
	public unpinAll() {
		return this.execute<boolean>("unpinAllChatMessages", {});
	}

	public editText(text: string = this.text, params?: ITextEditParams | ICaptionEditParams) {
		let isCaptionEdit = (params && params.message_id) || this.hasAttachments;
		if (isCaptionEdit)
			params["caption"] = text;
		else
			params["text"] = text;

		return this.execute<IUpdateResult>(isCaptionEdit 
			? "editMessageCaption" 
			: "editMessageText",
		params);
	}
	public delete(msgId = this.id) {
		return this.execute<boolean>("deleteMessage", {
			message_id: msgId
		});
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

	public async attach<TAttachmentType extends AttachmentType>(
		type: TAttachmentType,
		source: string | Buffer | ReadStream | Attachment<any>,
		params: Partial<IAttachmentSendParams> = {}
	) {
		let sourceParams = {
			[type]: typeof source === "string" || !(source instanceof Attachment<any>)
				? source
				: { file_id: source }
		};

		let response = await this.execute<IUpdateResult>(
			`send${StringUtils.capitalizeFirst(type)}`, 
			{ ...params, ...sourceParams }
		);
		return new Message(response.message);
	}
	private reply(method: string, params: Partial<IBaseSendParams>) {
		params.reply_to_message_id = this.id;
		return this.send(method, params);
	}
	private async send(method: string, params: Partial<IBaseSendParams>) {
		params.chat_id = this.chat.id;
		let response = await this.execute<IUpdateResult>(
			`send${StringUtils.capitalizeFirst(method)}`, 
			params
		);
		return new Message(response.message);
	}

	private async execute<TResult>(
		method: string, 
		params: Record<string, any>, 
		apiMethod: "callMethod" | "update" = "callMethod"
	) {
		params.chat_id = this.chat.id;
		return (await this.api[apiMethod]<TResult>(method, params)).result;
	}
}
