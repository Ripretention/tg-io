export interface IKeyboard {
	keyboard: IKeyboardButton[][];
	resize_keyboard?: boolean;
	one_time_keyboard?: boolean;
	input_field_placeholder?: string;
	selective?: boolean;
}
export interface IKeyboardButton {
	text: string;
	request_user?: {
		request_id: number;
		user_is_bot?: boolean;
		user_is_premium?: boolean;
	};
	request_chat?: {
		request_id: number;
		chat_is_channel: boolean;
		chat_is_forum?: boolean;
		chat_has_username?: boolean;
		chat_is_created?: boolean;
		bot_is_member?: boolean;
	};
	request_contact?: boolean;
	request_location?: boolean;
	request_poll?: {
		type: "quiz" | "regular";
	};
}
export interface IKeyboardRemove {
	remove_keyboard: boolean;
	selective?: boolean;
}

export interface IKeyboardInline {
	inline_keyboard: IKeyboardInlineButton[][];
}
export interface IKeyboardInlineButton {
	text: string;
	url?: string;
	callback_data?: string;
	switch_inline_query?: string;
	switch_inline_query_current_chat?: string;
}
