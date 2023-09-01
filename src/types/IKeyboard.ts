export interface IKeyboard {
	keyboard: IKeyboardButton[][];
	resize_keyboard?: boolean;
	one_time_keyboard?: boolean;
	input_field_placeholder?: string;
	selective?: boolean;
}
export interface IKeyboardButton {
	readonly text: string;
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
