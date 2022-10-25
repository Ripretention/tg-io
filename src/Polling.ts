import {Api} from "./Api"; 
import * as debug from "debug";
import {UpdateHandler} from "./UpdateHandler";
import {IUpdateCollection} from "./types/IUpdate";

export class Polling {
	private log = debug("tg-io:polling");	
	private state = PollingState.NotLaunched;
	constructor(private readonly api: Api) {}

	public async start(handler: UpdateHandler) {
		if (this.state === PollingState.Working)
			return;

		this.log("started");

		let offset = null;
		this.state = PollingState.Working;
		while (this.state === PollingState.Working) {
			let updates = await this.api.callMethod("getUpdates", (offset === null ? {} : { offset })) as IUpdateCollection;

			for (let update of updates.result) {
				await handler.handle(update);
				offset = update.update_id+1;
			}
		}
	}
	public stop() {
		if (this.state !== PollingState.Working)
			return;

		this.log("stopped");
		this.state = PollingState.Stopped;
	}
}
export enum PollingState {
	NotLaunched,
	Working,
	Stopped,
	Failed
}
