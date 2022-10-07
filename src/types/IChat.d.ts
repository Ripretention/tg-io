export interface IChat {
	id: number;
	type: ChatType;
	title?: string;
	username?: string;
	all_members_are_administrators?: boolean;
}
export type ChatType = "private" | "group" | "supergroup" | "channel";
