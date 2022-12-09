import {IBotCommand, IBotCommandScope} from "../types/IBotCommand";
import {ObjectUtils} from "../Utils";
import {BotCommandList} from "./BotCommandList";

export class CommandInfoDecoratorMetadata {
	private readonly storage: ({ 
		lang?: string;
		scope: IBotCommandScope;
	} & IBotCommand)[] = [];
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
			scope: (scope ?? { type: "default" })
		});
	}
	public implement(cmdList: BotCommandList) {
		let initLanguage = cmdList.getLang();
		let initScope = cmdList.getScope();
		for (let cmd of this.storage) {
			cmdList.setLanguage(cmd.lang);
			cmdList.setScope(
				cmd.scope.type,
				ObjectUtils.filterObjectByKey(cmd.scope, k => k !== "type")
			);

			cmdList.add(cmd.command, cmd.description);
		}

		cmdList.setLanguage(initLanguage);
		cmdList.setScope(
			initScope.type, 
			ObjectUtils.filterObjectByKey(initScope, k => k !== "type")
		);
	}
}
export function CommandInfo(
	command: string,
	descroption: string,
	language?: string,
	scope?: IBotCommandScope
): MethodDecorator {
	return target => {
		if (!target.constructor.prototype.__tgCommandInfo)
			target.constructor.prototype.__tgCommandInfo = new CommandInfoDecoratorMetadata();
		let metadata = target.constructor.prototype.__tgCommandInfo;

		metadata.add(command, descroption, language, scope);
		return target;
	};
}
