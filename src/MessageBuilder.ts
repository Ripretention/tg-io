import {IMessageEntity, MessageEntityType} from "./types/IMessageEntity";
import {IMessageSendParams} from "./types/params/ISendParams";
import {IUser} from "./types/IUser";
import {ObjectUtils} from "./Utils";

type FormattedMessage = Pick<IMessageSendParams, "entities" | "text">;
export class MessageBuilder {
	public static build(builderFn: (builder: MessageBuilderComponent) => string): FormattedMessage {
		let entities: IMessageEntity[] = [];
		let component = new MessageBuilderComponent();
		let text = builderFn(component);

		let componentStartBorder = "[" + component.id + "|id";
		for (let index = text.indexOf(componentStartBorder); index !== -1; index = text.indexOf(componentStartBorder)) {
			let componentEndBorderIndex = text.indexOf("]", index);
			let entityId = text.slice(index + componentStartBorder.length, componentEndBorderIndex);
			let entity = component.getEntityById(entityId);

			for (let type of entity.types)
				entities.push({
					type: type.type,
					length: entity.content.length,
					offset: index,
					...(ObjectUtils.filterObjectByKey(type, p => p !== "type"))
				});
			text = text.slice(0, index) + entity.content + text.slice(componentEndBorderIndex+1);
		}

		return {
			text,
			entities
		};
	}
	public static concat(...formattedMessages: FormattedMessage[]) {
		return formattedMessages.reduce((acc, msg) => {
			msg.entities = msg?.entities?.map(e => {
				e.offset += acc.text.length;
				return e;
			}) ?? [];

			msg.entities = (acc?.entities ?? []).concat(msg.entities);
			msg.text = acc.text + msg.text;

			return msg;
		}, { text: "" } as FormattedMessage);
	}
}
class MessageBuilderComponent {
	public readonly id = `MessageBuilder${Math.random()}`;
	private entities: Record<string, { 
		content: string;
		types: {
			type: MessageEntityType;
			[key: string]: any;
		}[]
	}> = {};
	public getEntityById(entityId: string) {
		return this.entities[entityId];
	}

	public mention(content: string) {
		return this.add(content, {
			type: "mention"
		});
	}
	public hashtag(content: string) {
		return this.add(content, {
			type: "hashtag"
		});
	}
	public cashtag(content: string) {
		return this.add(content, {
			type: "cashtag"
		});
	}
	public command(content: string) {
		return this.add(content, {
			type: "bot_command"
		});
	}
	public url(content: string) {
		return this.add(content, {
			type: "url"
		});
	}
	public email(content: string) {
		return this.add(content, {
			type: "email"
		});
	}
	public phone(content: string) {
		return this.add(content, {
			type: "phone_number"
		});
	}
	public bold(content: string) {
		return this.add(content, {
			type: "bold"
		});
	}
	public italic(content: string) {
		return this.add(content, {
			type: "italic"
		});
	}
	public underline(content: string) {
		return this.add(content, {
			type: "underline"
		});
	}
	public strikethrough(content: string) {
		return this.add(content, {
			type: "strikethrough"
		});
	}
	public spoiler(content: string) {
		return this.add(content, {
			type: "spoiler"
		});
	}
	public code(content: string) {
		return this.add(content, {
			type: "code"
		});
	}
	public pre(content: string, language: string) {
		return this.add(content, {
			type: "pre",
			language
		});
	}
	public textLink(content: string, url: string) {
		return this.add(content, {
			type: "text_link",
			url
		});
	}
	public textMention(content: string, user: IUser) {
		return this.add(content, {
			type: "text_mention",
			user	
		});
	}
	public emoji(content: string, emoji: string) {
		return this.add(content, {
			type: "custom_emoji",
			custom_emoji: emoji	
		});
	}

	private add(content: string, entity: {
		type: MessageEntityType;
		[key: string]: any;
	}) {
		if (content.includes(this.id)) {
			let { 1: id } = content.match(/id([^\]]+)/);
			this.entities[id].types.push(entity);
			return content;
		}

		let id = `${Math.random()}${content.length}`;
		this.entities[id] = {
			content: content,
			types: [entity]
		};
		return `[${this.id}|id${id}]`;
	}
}
