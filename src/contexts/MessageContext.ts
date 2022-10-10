import {Api} from "../Api";
import {Message} from "../models/Message";
import {IMessage} from "../types/IMessage";
import {IBaseSendParams} from "../types/ISendParams";
import {IUpdateCollection} from "../types/IUpdate";

export class MessageContext extends Message {
	constructor(private readonly api: Api, source: IMessage) {
		super(source);
	}

	public sendMessage(params: { text: string } & Partial<IBaseSendParams>): Promise<IUpdateCollection> {	
		return this.api.callMethod("sendMessage", { 
			chat_id: this.chat.id, 
			...params 
		});
	}
}
