import { IMessage } from "./IMessage";

export interface IUpdateFailed {
	ok: boolean;
	error_code: number;
	description: string;
}
export interface IUpdateCollection {
	ok: boolean;
	result: IUpdate[]
}
export interface IUpdate {
	update_id: number;
	message?: IMessage;
	[key: string]: any;
}
