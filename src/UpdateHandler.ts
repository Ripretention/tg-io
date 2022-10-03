import { IMessage } from "./types/IMessage";
import { IUpdate } from "./types/IUpdate";

export type CommandMatch = string | string[] | RegExp;
export type UpdateHandlerFn<TUpdate> = (context: TUpdate, next: () => void) => any;
export class UpdateHandler {
	private updates: { [kind: string]: UpdateHandlerFn<any>[] } = {};

	public async handle(update: IUpdate) {
		let middlewareState = HandlerMiddlewareState.Next;
		let nextMiddlewareFn = () => { 
			middlewareState = HandlerMiddlewareState.Next; 
		};

		for (let updateHandler of Object.entries(this.updates)
			.filter(([key]) => Object.keys(update).includes(key))
			.flatMap(([_, body]) => body)
		) {
			if (middlewareState === HandlerMiddlewareState.Next) {
				middlewareState = HandlerMiddlewareState.Stop;
				await updateHandler(update, nextMiddlewareFn);
				continue;
			}
			break;
		}
	}

	public onUpdate<TUpdate>(updateKind: string, handler: UpdateHandlerFn<TUpdate>) {
		if (!this.updates.hasOwnProperty(updateKind))
			this.updates[updateKind] = [];
		this.updates[updateKind].push((upd, next) => handler(upd[updateKind], next));
	}
	public hearCommand(match: CommandMatch, handler: UpdateHandlerFn<IMessage>) {
		this.onUpdate<IMessage>("message", (upd, next) => {
			if (upd?.text ?? "" === "")
				return;

			let { text } = upd;
			if (
				(typeof match === "string" && text === match) ||
				(Array.isArray(match) && match.some(t => t === text)) ||
				(match as RegExp).test(text)
			)
				return handler(upd, next);
		});
	}
}

enum HandlerMiddlewareState {
	Next,
	Stop	
}
