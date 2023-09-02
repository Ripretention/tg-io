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
		return new Promise<void>((resolve, reject) => {
			this.handleUpdates(handler, resolve, reject).catch(reject);
		});
	}
	private async handleUpdates(
		handler: UpdateHandler,
		onstop: () => void,
		onerror: (err: unknown) => void
	) {
		let offset: number | undefined;
		this.state = EventTransportState.Working;
		while (this.state === EventTransportState.Working) {
			let updates = (await this.api.callMethod(
				"getUpdates",
				offset === undefined ? {} : { offset }
			)) as IUpdateCollection;

			offset += updates.result.length;
			Promise.all(
				updates.result.map(async update => {
					return await handler.handle(update);
				})
			).catch(onerror);
		}
		onstop();
	}

	public stop() {
		if (this.state !== EventTransportState.Working) return;

		this.log("stopped");
		this.state = EventTransportState.Stopped;
	}
}
