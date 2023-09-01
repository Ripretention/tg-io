import { Api } from "../Api";
import { ReadStream } from "fs";
import { capitalize } from "../utils";
import { Message } from "../models/Message";
import { ChatContext } from "./ChatContext";
import { IMessage } from "../types/IMessage";
import { IUpdateResult } from "../types/IUpdate";
import { Attachment } from "../models/attachments";
import {
	ICaptionEditParams,
	ITextEditParams,
} from "../types/params/IEditParams";
import {
	AttachmentType,
	IAttachmentSendParams,
	IBaseSendParams,
} from "../types/params/ISendParams";
import {
	IAttachment,
	IAudioAttachment,
	IDocumentAttachment,
	IPhotoAttachment,
	IVideoAttachment,
	IVoiceAttachment,
} from "../types/IAttachment";

type AttachmentSource<TAttachment extends IAttachment> =
	| string
	| Buffer
	| ReadStream
	| Attachment<TAttachment>;
type SendMessageParams = string | ({ text: string } & Partial<IBaseSendParams>);
export class MessageContext extends Message {
	public match: string[] = [];
	public chat = new ChatContext(this.api, this.get("chat"));
	constructor(private readonly api: Api, source: IMessage) {
		super(source);
	}

	public pin(id = this.id, disableNotification = true) {
		return this.execute<boolean>("pinChatMessage", {
			message_id: id,
			disable_notification: disableNotification,
		});
	}
	public unpin(id = this.id) {
		return this.execute<boolean>("unpinChatMessage", {
			message_id: id,
		});
	}
	public unpinAll() {
		return this.execute<boolean>("unpinAllChatMessages", {});
	}

	public editText(
		text: string = this.text,
		params: Partial<ITextEditParams | ICaptionEditParams> = {}
	) {
		let isCaptionEdit =
			(params && params.message_id) || this.hasAttachments;
		
		params[isCaptionEdit ? "caption" : "text"] = text;
		return this.execute<IUpdateResult>(
			isCaptionEdit ? "editMessageCaption" : "editMessageText",
			params
		);
	}
	public delete(msgId = this.id) {
		return this.execute<boolean>("deleteMessage", {
			message_id: msgId,
		});
	}

	public replyMessage(params: SendMessageParams) {
		params = typeof params === "string" ? { text: params } : params;

		return this.reply("message", params);
	}
	public sendMessage(params: SendMessageParams) {
		params = typeof params === "string" ? { text: params } : params;

		return this.send("message", params);
	}

	public readonly replyVoice = this.sendAttachWithCaption<IVoiceAttachment>(
		"voice",
		true
	);
	public readonly replyVideo = this.sendAttachWithCaption<IVideoAttachment>(
		"video",
		true
	);
	public readonly replyAudio = this.sendAttachWithCaption<IAudioAttachment>(
		"audio",
		true
	);
	public readonly replyPhoto = this.sendAttachWithCaption<IPhotoAttachment>(
		"photo",
		true
	);
	public readonly replyDocument =
		this.sendAttachWithCaption<IDocumentAttachment>("document", true);

	public readonly sendVoice =
		this.sendAttachWithCaption<IVoiceAttachment>("voice");
	public readonly sendVideo =
		this.sendAttachWithCaption<IVideoAttachment>("video");
	public readonly sendAudio =
		this.sendAttachWithCaption<IAudioAttachment>("audio");
	public readonly sendPhoto =
		this.sendAttachWithCaption<IPhotoAttachment>("photo");
	public readonly sendDocument =
		this.sendAttachWithCaption<IDocumentAttachment>("document");
	private sendAttachWithCaption<
		TAttachment extends { caption?: string } & IAttachment
	>(type: AttachmentType, reply = false) {
		return (
			source: AttachmentSource<TAttachment>,
			params: Partial<IAttachmentSendParams> | string
		) => {
			params = typeof params === "string" ? { caption: params } : params;

			if (reply)
				params["reply_to_message_id"] =
					params?.reply_to_message_id ?? this.id;

			return this.attach(type, source, params);
		};
	}
	public async attach<TAttachmentType extends AttachmentType>(
		type: TAttachmentType,
		source: AttachmentSource<any>,
		params: Partial<IAttachmentSendParams> = {}
	) {
		let sourceParams = {
			[type]:
				source instanceof Attachment<any>
					? { file_id: source.id }
					: source,
		};

		let response = await this.execute<IUpdateResult>(
			`send${capitalize(type)}`,
			{ ...params, ...sourceParams },
			"upload"
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
			`send${capitalize(method)}`,
			params
		);
		return new Message(response.message);
	}

	private async execute<TResult>(
		method: string,
		params: Record<string, any>,
		apiMethod: "callMethod" | "upload" = "callMethod"
	) {
		params.chat_id = this.chat.id;
		return (await this.api[apiMethod]<TResult>(method, params)).result;
	}
}
