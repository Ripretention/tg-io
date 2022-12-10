import {IBotCommand, IBotCommandScope} from "../types/IBotCommand";
import {ObjectUtils} from "../Utils";
import {CommandInfoDecoratorMetadata} from "./BotCommandDecorators";

export class BotCommandList {
	private commands: (IBotCommand & { 
		lang?: string; 
		scope?: IBotCommandScope; 
	})[] = [];
	private currentLang = "";
	private currentScope: IBotCommandScope = { type: "default" };
	public add(command: string, description: string) {
		this.commands.push({ 
			command, 
			description,
			lang: this.currentLang,
			scope: this.currentScope
		});

		return this;
	}
	public get() {
		let commandGroups = ObjectUtils.groupBy(this.commands, "lang");
		return commandGroups.map(cmdGroup => ({
			language: cmdGroup.key,
			commands: ObjectUtils.groupBy(cmdGroup.values, "scope").map(cmd => ({
				scope: cmd.key,
				bodies: cmd.values.map(body => ({
					command: body.command,
					description: body.description
				}))
			}))
		}));
	}
	public getLang() {
		return this.currentLang;
	}
	public getScope() {
		return this.currentScope;
	}

	public implementDecorators(...decoratedHandlers: Record<string, any>[]) {
		for (let handler of decoratedHandlers) {
			let metadata: CommandInfoDecoratorMetadata = handler?.constructor?.prototype?.__tgCommandInfo;
			if (!metadata)
				continue;

			metadata.implement(this);
		}
		return this;
	}

	public setScope(type: IBotCommandScope["type"], params?: Omit<IBotCommandScope, "type">) {
		this.currentScope = { type, ...(params ?? {}) };
		return this;
	}
	public resetScope() {
		this.currentScope = { type: "default" };
		return this;
	}
	public setLanguage(lang: string) {
		this.currentLang = lang;
		return this;
	}
	public resetLanguage() {
		this.setLanguage(null);
		return this;
	}
}
