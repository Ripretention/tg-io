export interface IBotCommand {
	command: string;
	description: string;
}
export type BotCommandScopeLabel =
	| "chat"
	| "default"
	| "chat_member"
	| "all_group_chats"
	| "all_private_chats"
	| "chat_administrators"
	| "all_chat_administrators";
export interface IBotCommandScope {
	type: BotCommandScopeLabel;
	chat_id?: string | number;
	user_id?: number;
}
