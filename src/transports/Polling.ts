import * as debug from "debug";
import { UpdateHandler } from "../UpdateHandler";
import { IUpdateCollection } from "../types/IUpdate";
import { EventTransport, EventTransportState } from "./EventTransport";

export class Polling extends EventTransport {
	private log = debug("tg-io:polling");

	public async start(handler: UpdateHandler) {
		if (this.state === EventTransportState.Working) return;

		this.log("started");

		let offset = null;
		this.state = EventTransportState.Working;
		while (this.state === EventTransportState.Working) {
			let updates = (await this.api.callMethod(
				"getUpdates",
				offset === null ? {} : { offset }
			)) as IUpdateCollection;

			await Promise.all(updates.result.map(async update => {
				offset = update.update_id + 1;
				return await handler.handle(update);
			}));
		}
	}

	public stop() {
		if (this.state !== EventTransportState.Working) return;

		this.log("stopped");
		this.state = EventTransportState.Stopped;
	}
}
