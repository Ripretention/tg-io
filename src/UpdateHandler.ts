import { IUpdate } from "./types/IUpdate";

export type UpdateHandlerFn<TUpdate> = (context: TUpdate, next: () => void) => any;
export class UpdateHandler {
	private updates: { [kind: string]: UpdateHandlerFn<any>[] } = {};

	public async handle(update: IUpdate) {
		let middlewareState = HandlerMiddlewareState.Next;

		for (let updateHandler of Object.entries(this.updates)
			.filter(([key, _]) => Object.keys(update).includes(key))
			.flatMap(([_, body]) => body)
		) {
			if (middlewareState === HandlerMiddlewareState.Next) {
				middlewareState = HandlerMiddlewareState.Stop;
				await updateHandler(update, () => { middlewareState = HandlerMiddlewareState.Next; });
				continue;
			}
			break;
		}
	}

	public onUpdate<TUpdate>(updateKind: string, handler: UpdateHandlerFn<TUpdate>) {
		if (!this.updates.hasOwnProperty(updateKind))
			this.updates[updateKind] = [];
		this.updates[updateKind].unshift(handler);
	}
}

enum HandlerMiddlewareState {
	Next,
	Stop	
}
