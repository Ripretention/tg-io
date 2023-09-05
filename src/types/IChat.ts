export interface IChat {
	id: number;
	type: ChatType;
	title?: string;
	username?: string;
	all_members_are_administrators?: boolean;
}
export interface IChatShared {
	request_id: number;
	chat_id: number;
}
export type ChatType = "private" | "group" | "supergroup" | "channel";
