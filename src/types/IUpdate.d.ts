import { IMessage } from "./IMessage";

export interface IUpdateCollection {
	ok: boolean;
	result: IUpdate[]
}
export interface IUpdate {
	update_id: number;
	message?: IMessage;
	[key: string]: any;
}
