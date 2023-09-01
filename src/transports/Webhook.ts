import { Api } from "../Api";
import * as debug from "debug";
import * as https from "https";
import { UpdateHandler } from "../UpdateHandler";
import { EventTransport, EventTransportState } from "./EventTransport";
import { PathLike } from "fs";
import { readFile } from "fs/promises";
import { IUpdateCollection } from "../types/IUpdate";

type WebhookOptions = {
	url: string;
	ip?: string;
	secret?: string;
	maxConnections?: number;
	tls: {
		key: PathLike;
		cert: PathLike;
	};
};
type SupportedPort = 443 | 80 | 88 | 8443;
export class Webhook extends EventTransport {
	private server: https.Server;
	private log = debug("tg-io:webhook");
	constructor(api: Api, private readonly options: WebhookOptions) {
		super(api);
	}

	public async start(
		handler: UpdateHandler,
		port: SupportedPort = 8443
	): Promise<void> {
		if (this.state === EventTransportState.Working) return;

		if (!(await this.isValid())) this.setupWebhook();

		this.server = await this.createServer(handler);
		this.server.listen(port);

		this.log(`started on ${port} port`);
		this.state = EventTransportState.Working;
	}
	public stop(): void {
		if (this.state !== EventTransportState.Working) return;

		this.log("stopped");
		this.revokeWebhook();
		this.state = EventTransportState.Stopped;
	}

	private async isValid() {
		let opts = this.options;
		let response: Record<string, any> = await this.api.callMethod(
			"getWebhookInfo",
			{}
		);

		return (
			opts.url === response.url &&
			opts.maxConnections === response.max_connections &&
			opts.ip === response.ip_address
		);
	}
	private setupWebhook() {
		let opts = this.options;
		let params: Record<string, any> = {
			url: opts.url,
			max_connections: opts?.maxConnections ?? 40,
			certificate: opts.tls.cert,
		};
		if (opts.secret) params.secret = opts.secret;

		this.log("configured");
		return this.api.callMethod("setWebhook", params);
	}
	private revokeWebhook() {
		this.log("configuration revoked");
		return this.api.callMethod("deleteWebhook", {});
	}

	private async createServer(handler: UpdateHandler) {
		return new https.Server(
			{
				key: await readFile(this.options.tls.key),
				cert: await readFile(this.options.tls.cert),
			},
			async req => {
				if (
					this.secret &&
					req.headers["X-Telegram-Bot-Api-Secret-Token"] !==
						this.secret
				)
					return;

				let chunks = [];
				for await (let chunk of req) chunks.push(chunk);

				let body: IUpdateCollection;
				try {
					body = JSON.parse(Buffer.concat(chunks).toString());
				} catch (_) {
					this.log("failed JSON parsing");
					return;
				}

				for (let upd of body.result) await handler.handle(upd);
			}
		);
	}
	private get secret() {
		return this?.options?.secret?.slice(0, 256);
	}
}
