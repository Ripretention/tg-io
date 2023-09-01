import type { Api } from "../Api";
import type { UpdateHandler } from "../UpdateHandler";

export abstract class EventTransport {
	protected state = EventTransportState.NotLaunched;
	constructor(protected readonly api: Api) {}

	public abstract start(
		handler: UpdateHandler,
		...args: any[]
	): Promise<void>;
	public abstract stop(): void;

	public getState = () => this.state;
}
export enum EventTransportState {
	NotLaunched,
	Working,
	Stopped,
	Failed,
}
