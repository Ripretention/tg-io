import {IUser} from "./IUser";

export type MessageEntityType = 
	"mention" |
	"hashtag" |
	"cashtag" |
	"bot_command" |
	"url" |
	"email" |
	"phone_number" |
	"bold" |
	"italic" |
	"underline" |
	"strikethrough" |
	"spoiler" |
	"code" |
	"pre" |
	"text_link" |
	"text_mention" |
	"custom_emoji";
export interface IMessageEntity {
	type: MessageEntityType;
	offset: number;
	length: number;
	url?: string;
	user?: IUser;
	language?: string;
	custom_emoji_id?: string;
}
