import { Api } from "../Api";
import { ReadStream } from "fs";
import { capitalize } from "../utils";
import { Message, Attachment } from "../models";
import { ChatContext } from "./ChatContext";
import * as Params from "../types/params";
import {
	IUpdateResult,
	IMessage,
	IAttachment,
	IAudioAttachment,
	IDocumentAttachment,
	IPhotoAttachment,
	IVideoAttachment,
	IVoiceAttachment,
	IKeyboard,
	IKeyboardInline,
} from "../types";
import { AttachmentType, IAttachmentSendParams } from "../types/params";
import { Conversation } from "../converstations/Conversation";
import { ConversationOptions } from "../converstations";

type AttachmentSource<TAttachment extends IAttachment> =
	| string
	| Buffer
	| ReadStream
	| Attachment<TAttachment>;
type SendMessageParams =
	| string
	| ({ text: string } & Partial<Params.IMessageSendParams>);

export class MessageContext extends Message {
	public match: string[] = [];
	public chat = new ChatContext(this.api, this.get("chat"));
	constructor(
		private readonly api: Api,
		source: IMessage,
		private readonly conversation?: Conversation
	) {
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

	public ask(options?: ConversationOptions) {
		if (!this.conversation) {
			throw new Error(
				"First you should implement conversations before start polling"
			);
		}

		return this.conversation.waitAnswer(this, options);
	}

	public async copyTo(
		targetChatId: number | string,
		params: Partial<Params.ICopyParams> = {}
	) {
		params.chat_id = targetChatId;
		if (!params.message_id) {
			params.message_id = this.id;
		}
		if (!params.from_chat_id) {
			params.from_chat_id = this.chat.id;
		}

		let response = await this.execute<boolean | IUpdateResult>(
			"copyMessage",
			params
		);
		return typeof response === "object"
			? new Message(response.message)
			: undefined;
	}

	public async editText(
		text: string = this.text,
		params: Partial<Params.ITextEditParams | Params.ICaptionEditParams> = {}
	) {
		let isCaptionEdit = this.hasAttachments;

		params[isCaptionEdit ? "caption" : "text"] = text;
		if (!params.message_id) {
			params.message_id = this.id;
		}
		if (params.message_id === this.id) {
			this.text = text;
			this.keyboard = params.reply_markup ?? this.keyboard;
		}

		let response = await this.execute<boolean | IUpdateResult>(
			isCaptionEdit ? "editMessageCaption" : "editMessageText",
			params
		);
		return typeof response === "object"
			? new Message(response.message)
			: undefined;
	}
	public async editKeyboard(
		keyboard: IKeyboard | IKeyboardInline,
		params: Partial<Params.IBaseEditParams> = {}
	) {
		params.reply_markup = keyboard;

		if (!params.message_id) {
			params.message_id = this.id;
		}
		if (params.message_id === this.id) {
			this.keyboard = keyboard;
		}

		let response = await this.execute<boolean | IUpdateResult>(
			"editMessageReplyMarkup",
			params
		);
		return typeof response === "object"
			? new Message(response.message)
			: undefined;
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
		TAttachment extends { caption?: string } & IAttachment,
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
		params: Partial<Params.IAttachmentSendParams> = {}
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
	private reply(method: string, params: Partial<Params.IBaseSendParams>) {
		params.reply_to_message_id = this.id;
		return this.send(method, params);
	}
	private async send(
		method: string,
		params: Partial<Params.IBaseSendParams>
	) {
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
