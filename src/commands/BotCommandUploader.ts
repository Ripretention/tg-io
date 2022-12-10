import {Api} from "../Api";
import {IBotCommand, IBotCommandScope} from "../types/IBotCommand";
import {BotCommandList} from "./BotCommandList";

export class BotCommandUploader {
	constructor(private readonly api: Api) {}
	public async upload(list: BotCommandList) {
		let commandList = list.get();

		for (let { language, commands: languageCommands } of commandList) {
			for (let { scope, bodies: commands } of languageCommands) {
				if (await this.checkActuality(
					language, 
					commands,
					scope
				)) {
					continue;
				}

				await this.api.callMethod("setMyCommands", {
					commands,
					scope,
					language_code: language
				});
			}
		}
	}
	private async checkActuality(
		lang: string, 
		commands: IBotCommand[],
		scope: IBotCommandScope
	) {
		let { result } = await this.api.callMethod<IBotCommand[]>("getMyCommands", {
			scope,
			language_code: lang
		});

		return result.length > 0 && result.every(resCmd => 
			commands.some(cmd => 
				cmd.command === resCmd.command && cmd.description === resCmd.description
			)
		);
	}
}
