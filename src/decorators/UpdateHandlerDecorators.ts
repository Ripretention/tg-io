import { MessageContext } from "../contexts/MessageContext";
import { IMessage } from "../types";
import { TextMatch, UpdateHandler } from "../UpdateHandler";

type UpdateHandlerMethod = keyof InstanceType<typeof UpdateHandler>;
export class UpdateHandlerDecoratorMetadata {
	private storage: Record<string, any[]> = {};
	public add(method: UpdateHandlerMethod, ...args: any[]) {
		if (!this.storage.hasOwnProperty(method)) this.storage[method] = [];
		this.storage[method].push(args);
	}
	public implement<T>(handler: UpdateHandler, instance: T) {
		for (let [method, metadata] of Object.entries(this.storage))
			for (let args of metadata)
				handler[method](
					...args.map((arg: any) =>
						typeof arg === "function" ? arg.bind(instance) : arg
					)
				);
	}
}

function injectMetadata(
	obj: Record<string, any>
): UpdateHandlerDecoratorMetadata {
	if (!obj.constructor.prototype.__tgHandlerMetadata)
		obj.constructor.prototype.__tgHandlerMetadata =
			new UpdateHandlerDecoratorMetadata();

	return obj.constructor.prototype.__tgHandlerMetadata;
}
export function Command(pattern: TextMatch): MethodDecorator {
	return (target, _, descriptor) => {
		injectMetadata(target).add("hearCommand", pattern, descriptor.value);
		return target;
	};
}
export function Use(): MethodDecorator {
	return (target, _, descriptor) => {
		injectMetadata(target).add("use", descriptor.value);
		return target;
	};
}
export function Update(
	updateKind: string,
	skipConvertingToContext = false
): MethodDecorator {
	return (target, _, descriptor) => {
		injectMetadata(target).add(
			"onUpdate",
			updateKind,
			descriptor.value,
			skipConvertingToContext
		);
		return target;
	};
}
export function Event(event: keyof MessageContext | IMessage): MethodDecorator {
	return (target, _, descriptor) => {
		injectMetadata(target).add("onMessageEvent", event, descriptor.value);
		return target;
	};
}
export function CallbackQuery(pattern: TextMatch): MethodDecorator {
	return (target, prop, descriptor) => {
		injectMetadata(target).add(
			"hearCallbackQuery",
			pattern,
			descriptor.value
		);
		return target;
	};
}
