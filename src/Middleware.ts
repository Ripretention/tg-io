export class MiddlewareToken {
	private passingState = true;
	public reset() {
		return this.next();
	}
	public get() {
		return this.passingState;
	}
	public next() {
		this.passingState = true;
	}
	public async complete(fn: () => Promise<any>) {
		if (!this.passingState)
			return;

		this.passingState = false;
		await fn();
	}
}
type MiddlewareFn<T> = (arg: T, next: (nextArg?: T) => void) => any;
export class Middleware<T> {
	private handlers: MiddlewareFn<T>[] = [];
	constructor(private readonly token: MiddlewareToken) {}

	public async handle(arg: T) {
		let value = arg;
		let next = (a?: T) => {
			if (a)
				value = a;
			return this.token.next();
		};
		for (let handler of this.handlers)
			await this.token.complete(
				() => handler(value, next),
			);
	}
	public add(handler: MiddlewareFn<T>) {
		this.handlers.push(handler);
		return this;
	}
}
