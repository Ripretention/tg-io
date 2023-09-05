export interface IUser {
	id: number;
	first_name: string;
	is_bot: boolean;
	language_code?: string;
	last_name?: string;
	username?: string;
}
export interface IUserShared {
	request_id: number;
	user_id: number;
}
