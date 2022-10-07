import { IUpdate } from "../src/types/IUpdate";
import { UpdateHandler } from "../src/UpdateHandler";
let handler: UpdateHandler; 
let baseUpdate: IUpdate = {
	update_id: 1,
	message: {
		message_id: 1,	
		date: null,
		text: "/test"
	}
};

beforeEach(() => {
	handler = new UpdateHandler(null);
});
describe("onUpdate", () => {
	test("check correct work of next function in middleware", async () => {
		let handledUpdateCount = 0;
		let update = baseUpdate;
		let testHandler = (_: any, next: () => void) => {
			handledUpdateCount++;
			if (handledUpdateCount < 4)
				next();
		};
		for (let i = 0; i < 10; i++)
			handler.onUpdate("message", testHandler);

		await handler.handle(update);

		expect(handledUpdateCount).toBe(4);
	});
	test("should correct match with update type", async () => {
		let handledUpdateCount = 0;
		let update: IUpdate = {
			...baseUpdate,
			someDoppedUpdate: {},
			newPhoto: null
		};
		let testHandler = (_: any, next: () => void) => {
			handledUpdateCount++;
			next();
		};
		handler.onUpdate("message", testHandler);
		handler.onUpdate("newPhoto", testHandler);

		await handler.handle(update);

		expect(handledUpdateCount).toBe(2);
	});
});

describe("hearCommand", () => {
	let update = baseUpdate;
	test("should pass basic string match", async () => {
		let handled = false;
		handler.hearCommand("/test", () => { handled = true; });

		await handler.handle(update);
		
		expect(handled).toBe(true);
	});
	test("should pass string[] match", async () => {
		let handledCommads = 0;
		handler.hearCommand(["/test", "/test2"], () => { handledCommads++; });

		await handler.handle(update);
		update.message.text = "/test2";
		await handler.handle(update);
		
		expect(handledCommads).toBe(2);
	});
	test("should pass regex match", async () => {
		let handledCommads = 0;
		handler.hearCommand(/^\/test/i, () => { handledCommads++; });

		await handler.handle(update);
		update.message.text = "/test2";
		await handler.handle(update);
		
		expect(handledCommads).toBe(2);
	});
});

describe("use", () => {
	let update = baseUpdate;

	test("check right handling queue", async () => {
		let queue: string[] = [];	
		handler.hearCommand(/^\/test/i, (_, next) => {
			queue.push("hearCommand");
			next();
		});
		handler.onUpdate("message", (_, next) => {
			queue.push("onUpdate");
			next();
		});
		handler.use((_, next) => {
			queue.push("use");
			next();
		});

		await handler.handle(update);

		expect(queue).toStrictEqual(["use", "hearCommand", "onUpdate"]);
	});
});

describe("onMessageEvent", () => {
	let update = {
		update_id: 2,
		message: {
			message_id: 2,
			date: null,
			text: "/some command",
			event1: {},
			event2: {},
			event3: {},
			unhandledEvent: {}
		}
	};

	test("should be called 3 times", async () => {
		let handledEvents = 0;
		for (let i = 1; i <= 3; i++)
			handler.onMessageEvent(`event${i}`, (_, next) => {
				handledEvents++;
				next();
			});

		await handler.handle(update);

		expect(handledEvents).toBe(3);
	});
});
