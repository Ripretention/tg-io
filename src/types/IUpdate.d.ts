export interface IUpdateCollection {
	ok: boolean;
	result: IUpdate[]
}
export interface IUpdate {
	[key: string]: any;
	update_id: number;
}
