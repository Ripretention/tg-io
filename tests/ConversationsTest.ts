import { MessageContext } from "../src/contexts/MessageContext";
import { IUpdateResult } from "../src/types/IUpdate";
import { UpdateHandler } from "../src/UpdateHandler";
import { setTimeout } from "timers/promises";

let handler: UpdateHandler;
let baseUpdate: IUpdateResult = {
	update_id: 1,
	message: {
		message_id: 1,
		chat: {
			id: 1,
			type: "private",
		},
		date: null,
		text: "/test",
	},
};

function createUpdateWithText(text: string): IUpdateResult {
	return Object.assign({}, baseUpdate, {
		message: { ...baseUpdate.message, text },
	});
}

beforeEach(() => {
	handler = new UpdateHandler(null);
});

test("should throw error whether conversation wasn't implemented", async () => {
	handler.hearCommand("/test", async ctx => {
		let catchedError = false;
		try {
			await ctx.ask();
		} catch (err) {
			catchedError = true;
		} finally {
			expect(catchedError).toBe(true);
		}
	});
	await handler.handle(baseUpdate);
});
test("should provide correct context after waiting", async () => {
	handler.hearCommand("/test", async ctx => {
		let { ctx: newCtx } = await ctx.ask();
		expect(newCtx.text).toBe("my prompt");
	});

	handler.implementConversations();
	await Promise.all([
		handler.handle(baseUpdate),
		handler.handle(createUpdateWithText("my prompt")),
	]);
});
test("should provide correctly parse values after waiting", async () => {
	handler.hearCommand("/test", async ctx => {
		let answer = await ctx.ask({ condition: /(123)/ });
		expect(answer.asText).toBe("123");
		expect(answer.asNumber).toBe(123);
		expect(answer.asMatch[1]).toBe("123");
	});

	handler.implementConversations();
	await Promise.all([
		handler.handle(baseUpdate),
		handler.handle(createUpdateWithText("123")),
	]);
});
test("should respect conditions", async () => {
	expect.assertions(4);
	handler.hearCommand("/test", async ctx => {
		let answer = await ctx.ask({ condition: /321/ });
		expect(answer.asNumber).toBe(321);
		answer = await answer.ctx.ask({ condition: "okay" });
		expect(answer.toString()).toBe("okay");
		answer = await answer.ctx.ask({ condition: ["fine"] });
		expect(answer.toString()).toBe("fine");
		answer = await answer.ctx.ask({
			condition: upd => upd.text.length <= 3,
		});
		expect(answer.toString()).toBe("lol");
	});

	handler.implementConversations();
	handler.handle(baseUpdate).catch(err => {
		throw err;
	});

	await setTimeout(200);
	await handler.handle(createUpdateWithText("123"));
	await handler.handle(createUpdateWithText("321"));
	await handler.handle(createUpdateWithText("fine"));
	await handler.handle(createUpdateWithText("okay"));
	await handler.handle(createUpdateWithText("fine"));
	await handler.handle(createUpdateWithText("haha not me!!"));
	await handler.handle(createUpdateWithText("lol"));
});
test("should not block i/o", async () => {
	expect.assertions(4);
	handler.hearCommand("/test", async ctx => {
		let { ctx: newCtx } = await ctx.ask();
		expect(newCtx.text).toBe("my prompt");
		let answer = await ctx.ask({ condition: "my prompt4" });
		expect(answer.toString()).toBe("my prompt4");
	});
	handler.hearCommand("/lol", async ctx => {
		let { ctx: newCtx } = await ctx.ask();
		expect(newCtx.text).toBe("my prompt2");
		let answer = await ctx.ask({ condition: "my prompt3" });
		expect(answer.toString()).toBe("my prompt3");
	});

	handler.implementConversations();
	handler.handle(baseUpdate).catch(err => {
		throw err;
	});
	handler.handle(createUpdateWithText("/lol")).catch(err => {
		throw err;
	});

	await setTimeout(200);
	await handler.handle(createUpdateWithText("my prompt"));
	await handler.handle(createUpdateWithText("my prompt2"));
	await handler.handle(createUpdateWithText("my prompt3"));
	await handler.handle(createUpdateWithText("my prompt4"));
});
test("should handle condition fallback", async () => {
	handler.hearCommand("/test", async ctx => {
		await ctx.ask({
			condition: "never be!",
			conditionFallback: async upd => {
				expect(upd.text).toBe("what?");
			},
		});
	});

	handler.implementConversations();
handler.handle(baseUpdate).catch(err => {
		throw err;
	});

	await setTimeout(200);
		await handler.handle(createUpdateWithText("what?"));
});
describe("should provide correct next middleware logic", () => {
	test("should pass through conversation middleware whether conversations didn't start", async () => {
		let passedConversatiosHandler = false;
		handler.hearCommand("/test", (_, next) => {
			next();
		});
		handler.implementConversations();
		handler.onUpdate("message", async () => {
			passedConversatiosHandler = true;
		});

		await Promise.all([
			handler.handle(baseUpdate),
			handler.handle(createUpdateWithText("who am i")),
		]);

		expect(passedConversatiosHandler).toBeTruthy();
	});
	test("should NOT pass through conversation middleware whether conversation started and next middleware fn hadn't been called", async () => {
		let passed = false;
		handler.hearCommand("/test", async ctx => {
			await ctx.ask();
		});
		handler.implementConversations();
		handler.onUpdate("message", async () => {
			passed = true;
		});

		await Promise.all([
			handler.handle(baseUpdate),
			handler.handle(createUpdateWithText("idk")),
		]);
		expect(passed).toBeFalsy();
	});
	test("should provide correct context when passing", async () => {
		handler.hearCommand("/test", async ctx => {
			let { asText: content, ctx: upd, next } = await ctx.ask();
			upd.text = content + " payload from prev";
			next();
		});
		handler.implementConversations();
		handler.onUpdate("message", async (ctx: MessageContext) => {
			expect(ctx.text).toBe("i have payload from prev");
		});

		await Promise.all([
			handler.handle(baseUpdate),
			handler.handle(createUpdateWithText("i have")),
		]);
	});
});
