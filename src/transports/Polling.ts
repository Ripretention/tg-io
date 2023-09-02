import * as debug from "debug";
import { UpdateHandler } from "../UpdateHandler";
import { IUpdateCollection } from "../types/IUpdate";
import { EventTransport, EventTransportState } from "./EventTransport";

export class Polling extends EventTransport {
	private log = debug("tg-io:polling");

	public async start(handler: UpdateHandler) {
		if (this.state === EventTransportState.Working) {
			return;
		}

		this.log("started");

		let offset: number | undefined;
		this.state = EventTransportState.Working;
		return new Promise<void>((resolve, reject) => {
			while (this.state === EventTransportState.Working) {
				this.handleUpdates(handler, reject, offset).catch(reject);
			}
			resolve();
		});
	}
	private async handleUpdates(
		handler: UpdateHandler,
		onerror: (err: unknown) => void,
		offset?: number
	) {
		let updates = (await this.api.callMethod(
			"getUpdates",
			offset === undefined ? {} : { offset }
		)) as IUpdateCollection;

		Promise.all(
			updates.result.map(async update => {
				return await handler.handle(update);
			})
		).catch(onerror);
		return offset + updates.result.length;
	}

	public stop() {
		if (this.state !== EventTransportState.Working) return;

		this.log("stopped");
		this.state = EventTransportState.Stopped;
	}
}
