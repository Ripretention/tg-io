import { IBotCommand, IBotCommandScope } from "../types/IBotCommand";
import { filterObjectByKey } from "../Utils";
import { BotCommandList } from "./BotCommandList";

type CommandParameter<T> = ((arg: T) => string) | string;
export class CommandInfoDecoratorMetadata {
	private readonly storage: {
		command: CommandParameter<any>;
		description: CommandParameter<any>;
		lang?: CommandParameter<any>;
		scope: IBotCommandScope;
	}[] = [];
	public add(
		command: string,
		description: string,
		lang: string = null,
		scope?: IBotCommandScope
	) {
		this.storage.push({
			lang,
			command,
			description,
			scope: scope ?? { type: "default" },
		});
	}
	public implement<T>(cmdList: BotCommandList, instance: T) {
		let initLanguage = cmdList.getLang();
		let initScope = cmdList.getScope();
		for (let cmd of this.storage) {
			cmdList.setLanguage(this.parseCommandParameter(cmd.lang, instance));
			cmdList.setScope(
				cmd.scope.type,
				filterObjectByKey(cmd.scope, k => k !== "type")
			);

			cmdList.add(
				this.parseCommandParameter(cmd.command, instance),
				this.parseCommandParameter(cmd.description, instance)
			);
		}

		cmdList.setLanguage(initLanguage);
		cmdList.setScope(
			initScope.type,
			filterObjectByKey(initScope, k => k !== "type")
		);
	}
	private parseCommandParameter<T>(param: CommandParameter<T>, arg: T) {
		return typeof param === "function" ? param(arg) : param;
	}
}
export function CommandInfo<T>(
	command: CommandParameter<T>,
	description: CommandParameter<T>,
	language?: CommandParameter<T>,
	scope?: IBotCommandScope
): MethodDecorator {
	return target => {
		if (!target.constructor.prototype.__tgCommandInfo)
			target.constructor.prototype.__tgCommandInfo =
				new CommandInfoDecoratorMetadata();
		let metadata = target.constructor.prototype.__tgCommandInfo;

		metadata.add(command, description, language, scope);
		return target;
	};
}
