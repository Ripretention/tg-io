import { randomUUID } from "crypto";

export type MiddlewareFn<T> = (arg: T, next: (nextArg?: T) => void) => any;
export interface MiddlewareSegment<T> {
	id: string;
	fn: MiddlewareFn<T>;
}

export class MiddlewareToken {
	private passingState = true;
	public next() {
		this.passingState = true;
	}
	public async complete(fn: () => Promise<any>) {
		if (!this.passingState) return;

		this.passingState = false;
		await fn();
	}
}

export class Middleware<T> {
	private segments: MiddlewareSegment<T>[] = [];

	public async handle(arg: T, token: MiddlewareToken) {
		let accValue = arg;
		let next = (value?: T) => {
			if (value) {
				accValue = value;
			}

			return token.next();
		};

		for (let segment of this.segments) {
			await token.complete(() => segment.fn(accValue, next));
		}
	}
	public add(fn: MiddlewareFn<T>) {
		let segment: MiddlewareSegment<T> = {
			id: randomUUID(),
			fn,
		};

		this.segments.push(segment);
		return segment;
	}
	public remove(segment: MiddlewareSegment<T>) {
		let index = this.segments.findIndex(s => s.id === segment.id);
		if (index === -1) {
			return false;
		}

		this.segments.splice(index, 1);
		return true;
	}
}
