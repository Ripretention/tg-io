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

			for (let update of updates.result) {
				await handler.handle(update);
				offset = update.update_id + 1;
			}
		}
	}

	public stop() {
		if (this.state !== EventTransportState.Working) return;

		this.log("stopped");
		this.state = EventTransportState.Stopped;
	}
}
