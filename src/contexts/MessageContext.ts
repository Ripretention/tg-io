import {Api} from "../Api";
import {Message} from "../models/Message";
import {IMessage} from "../types/IMessage";
import {AttachmentSendParams, AttachmentTypes, IBaseSendParams} from "../types/ISendParams";
import {IUpdateCollection} from "../types/IUpdate";
import {StringUtils} from "../Utils";

type SendMessageParams = string | { text: string } & Partial<IBaseSendParams>;
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
	
	private reply(method: string, params: Partial<IBaseSendParams>) {
		params.reply_to_message_id = this.id;
		return this.send(method, params);
	}
	private send(method: string, params: Partial<IBaseSendParams>) {
		params.chat_id = this.chat.id;
		return this.api.callMethod(`send${StringUtils.capitalizeFirst(method)}`, params);
	}
}
