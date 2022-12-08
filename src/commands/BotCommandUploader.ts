import {Api} from "../Api";
import {IBotCommand, IBotCommandScope} from "../types/IBotCommand";
import {BotCommandList} from "./BotCommandList";

export class BotCommandUploader {
	constructor(private readonly api: Api) {}
	public async upload(list: BotCommandList) {
		let commandList = list.get();

		for (let { language, commands: languageCommands } of commandList) {
			let commands = languageCommands.flatMap(cmd => cmd.bodies);
			let scopes = languageCommands.map(cmd => cmd.scope);
			if (await this.checkActuality(
				language, 
				commands,
				scopes
			)) {
				continue;
			}

			await this.api.callMethod("setMyCommands", {
				commands,
				scope: scopes,
				language_code: language
			});
		}
	}
	private async checkActuality(
		lang: string, 
		commands: IBotCommand[],
		scopes: IBotCommandScope[]
	) {
		let { result } = await this.api.callMethod<IBotCommand[]>("getMyCommands", {
			scope: scopes,
			language_code: lang
		});

		return result.length > 0 && result.every(resCmd => 
			commands.some(cmd => 
				cmd.command === resCmd.command && cmd.description === resCmd.description
			)
		);
	}
}
