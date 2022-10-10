import {Api} from "../Api";
import {Message} from "../models/Message";
import {IMessage} from "../types/IMessage";
import {IBaseSendParams} from "../types/ISendParams";
import {IUpdate, IUpdateCollection} from "../types/IUpdate";

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

		params.reply_to_message_id = this.id;
		return this.sendMessage(params);
	}
	public sendMessage(params: SendMessageParams): Promise<IUpdateCollection> {	
		params = typeof params === "string" 
			? { text: params } 
			: params;

		return this.api.callMethod("sendMessage", { 
			chat_id: this.chat.id, 
			...params 
		});
	}
}
