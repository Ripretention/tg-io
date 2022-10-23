import {IMessageEntity, MessageEntityType} from "./types/IMessageEntity";
import {IMessageSendParams} from "./types/ISendParams";
import {ObjectUtils} from "./Utils";

export class MessageBuilder {
	public static build(builderFn: (builder: MessageBuilderComponent) => string): Pick<IMessageSendParams, "entities" | "text"> {
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

	private add(content: string, entity: {
		type: MessageEntityType;
		[key: string]: any;
	}) {
		if (content.includes(this.id)) {
			let { 1: id } = content.match(/id([^\]]+)/);
			this.entities[id].types.push(entity);
			return "";
		}

		let id = `${Math.random()}${content.length}`;
		this.entities[id] = {
			content: content,
			types: [entity]
		};
		return `[${this.id}|id${id}]`;
	}
}
