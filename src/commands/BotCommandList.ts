import {IBotCommand, IBotCommandScope} from "../types/IBotCommand";
import {ObjectUtils} from "../Utils";

export class BotCommandList {
	private commands: (IBotCommand & { 
		lang?: string; 
		scope?: IBotCommandScope; 
	})[] = [];
	private currentLang: string = null;
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
