import { CallbackQueryContext } from "../src/contexts/CallbackQueryContext";
import { MessageContext } from "../src/contexts/MessageContext";
import { IUpdateResult } from "../src/types/IUpdate";
import { UpdateHandler } from "../src/UpdateHandler";
let handler: UpdateHandler;
let baseUpdate: IUpdateResult = {
	update_id: 1,
	message: {
		message_id: 1,
		date: null,
		text: "/test",
	},
};

beforeEach(() => {
	handler = new UpdateHandler(null);
});
describe("onUpdate", () => {
	test("should handle next() correctly", async () => {
		let handledUpdateCount = 0;
		let update = baseUpdate;
		let testHandler = (_: any, next: () => void) => {
			handledUpdateCount++;
			if (handledUpdateCount < 4) next();
		};
		for (let i = 0; i < 10; i++) handler.onUpdate("message", testHandler);

		await handler.handle(update);

		expect(handledUpdateCount).toBe(4);
	});
	test("should match correct update type", async () => {
		let handledUpdateCount = 0;
		let update: IUpdateResult = {
			...baseUpdate,
			someDoppedUpdate: {},
			newPhoto: {},
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

describe("hearCallbackQuery", () => {
	let update: IUpdateResult = {
		update_id: 2,
		callback_query: {
			id: "qwe123",
			chat_instance: "qwe",
			from: {
				id: 1,
				is_bot: false,
				first_name: "Durov",
			},
			data: "nodata",
		},
	};
	test("should handle 7 updates", async () => {
		let handleCounter = 0;
		let fn = (_: any, next: () => void) => {
			handleCounter++;
			next();
		};
		handler.hearCallbackQuery(["test 1", "test 2"], fn);
		handler.hearCallbackQuery("test 3", fn);
		handler.hearCallbackQuery(/test [1-4]/, fn);

		for (let i = 0; i < 10; i++) {
			update.callback_query.data = "test " + i;
			await handler.handle(update);
		}

		expect(handleCounter).toBe(7);
	});
	test("should parse CallbackQueryContext correctly", async () => {
		let ctx: CallbackQueryContext;
		let { callback_query: query } = update;
		query.data = "somedatahere!";
		query.message = {
			message_id: 21,
			date: 1,
			from: query.from,
			text: "heyoo!",
		};
		handler.hearCallbackQuery(/somedatahere(.+)/i, evt => {
			ctx = evt;
		});

		await handler.handle(update);

		expect(ctx.data).toBe("somedatahere!");
		expect(ctx.match.join("")).toBe("somedatahere!!");
		expect(ctx.sender.id).toBe(ctx.message.sender.id);
		expect(ctx.message.text).toBe("heyoo!");
	});
});

describe("hearCommand", () => {
	let update = baseUpdate;
	test("should match command by text", async () => {
		let handled = false;
		handler.hearCommand("/test", () => {
			handled = true;
		});

		await handler.handle(update);

		expect(handled).toBe(true);
	});
	test("should match command by basic text array", async () => {
		let handledCommads = 0;
		handler.hearCommand(["/test", "/test2"], () => {
			handledCommads++;
		});

		await handler.handle(update);
		update.message.text = "/test2";
		await handler.handle(update);

		expect(handledCommads).toBe(2);
	});
	test("should match command by regex", async () => {
		let handledCommads = 0;
		handler.hearCommand(/^\/test/i, () => {
			handledCommads++;
		});

		await handler.handle(update);
		update.message.text = "/test2";
		await handler.handle(update);

		expect(handledCommads).toBe(2);
	});
});

describe("use", () => {
	let update = baseUpdate;

	test("should handle the queue orderly", async () => {
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
			photo: [],
		},
	};

	test("should match update", async () => {
		let handledEvents = 0;
		handler.onMessageEvent("photo", (_, next) => {
			handledEvents++;
			next();
		});

		await handler.handle(update);

		expect(handledEvents).toBe(1);
	});
});

describe("setContext", () => {
	test("should provde a custom context into next()", async () => {
		let update = baseUpdate;
		let payload: string;
		handler.setContext("message", TestMessage);
		handler.onUpdate("message", (ctx: TestMessage, next) => {
			ctx.specialTestPayload = "secret payload";
			next();
		});
		handler.hearCommand(/^\/test/, (ctx: TestMessage) => {
			payload = ctx.specialTestPayload;
		});

		await handler.handle(update);

		expect(payload).toBe("secret payload");
	});
	test("should set custom message context correctly", async () => {
		let update = baseUpdate;
		let testMessagePayload: string;
		handler.setContext("message", TestMessage);
		handler.hearCommand(/^\/test/, (ctx: TestMessage, next) => {
			testMessagePayload = ctx.toString();
			next();
		});

		await handler.handle(update);

		expect(testMessagePayload).toBe(
			`${update.message.message_id}: has test message no data`
		);
	});
	class TestMessage extends MessageContext {
		public specialTestPayload: string;
		public hasTestCommand = () => /^\/test/i.test(this.text);
		public toString() {
			return `${this.id}: ${
				this.hasTestCommand ? "has test message" : ""
			} ${this.specialTestPayload ?? "no data"}`;
		}
	}

	test("should set custom callback query context correctly", async () => {
		let ctx: TestCallbackQuery;
		let update: IUpdateResult = {
			update_id: 2,
			callback_query: {
				id: "qwe123",
				chat_instance: "qwe",
				from: {
					id: 1,
					is_bot: false,
					first_name: "Durov",
				},
				data: "nodata",
			},
		};
		handler.setContext("callback_query", TestCallbackQuery);
		handler.hearCallbackQuery<TestCallbackQuery>("nodata", evt => {
			ctx = evt;
		});

		await handler.handle(update);

		expect(ctx.appeal).toBe("Durov");
	});
	class TestCallbackQuery extends CallbackQueryContext {
		public get appeal() {
			return this.sender.firstname;
		}
	}
});
