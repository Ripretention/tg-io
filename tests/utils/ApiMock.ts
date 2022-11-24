import {Api} from "../../src/Api";

export class ApiMock {
	public api = new Api("");
	public callbacks: ((method: string, params: Record<string, any>) => any)[] = [];
	constructor() {
		this.api.upload = ((method, params) => this.api.callMethod(method, params)) as typeof this.api.upload;
		this.api.callMethod = ((method, params) => {
			for (let callback of this.callbacks) {
				let result = callback(method, params);
				if (result !== null)
					return result;
			}
			return Promise.resolve({ ok: true });
		}) as typeof this.api.callMethod;
	}

	public get() {
		return this.api;
	}
	public clear() {
		this.callbacks = [];
	}
	public addCallback(method: string, cb: (params: Record<string, any>) => any) {
		this.callbacks.push((m: string, p: Record<string, any>) => {
			if (m === method)
				return cb(p);
			return null;
		});
	}
}
