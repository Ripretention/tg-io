import { MessageContext } from "../src/contexts/MessageContext";
import { IUpdateResult } from "../src/types/IUpdate";
import { UpdateHandler } from "../src/UpdateHandler";

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
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "my prompt" } })
		),
	]);
});
test("should provide correctly parse values after waiting", async () => {
	handler.hearCommand("/test", async ctx => {
		let answer = await ctx.ask({ condition: /(123)/ });
		expect(answer.asText).toBe("123");
		expect(answer.asNumber).toBe(123);
		expect(answer.asMatch[1]).toBe(123);
	});

	handler.implementConversations();
	await Promise.all([
		handler.handle(baseUpdate),
		handler.handle(Object.assign(baseUpdate, { message: { text: "123" } })),
	]);
});
test("should respect conditions", async () => {
	handler.hearCommand("/test", async ctx => {
		let answer = await ctx.ask({ condition: /321/ });
		expect(answer.asNumber).toBe(321);
		answer = await ctx.ask({ condition: "okay" });
		expect(answer.toString()).toBe("okay");
		answer = await ctx.ask({ condition: ["fine"] });
		expect(answer.toString()).toBe("fine");
		answer = await ctx.ask({ condition: ctx => ctx.text.length <= 3 });
		expect(answer.toString()).toBe("lol");
	});

	handler.implementConversations();
	await Promise.all([
		handler.handle(baseUpdate),
		handler.handle(Object.assign(baseUpdate, { message: { text: "123" } })),
		handler.handle(Object.assign(baseUpdate, { message: { text: "321" } })),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "fine" } })
		),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "okay" } })
		),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "fine" } })
		),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "haha not me!!" } })
		),
		handler.handle(Object.assign(baseUpdate, { message: { text: "lol" } })),
	]);
});
test("should not block i/o", async () => {
	handler.hearCommand("/test", async ctx => {
		let { ctx: newCtx } = await ctx.ask();
		expect(newCtx.text).toBe("my prompt");
		let answer = await ctx.ask({ condition: "my prompt4" });
		expect(answer.toString()).toBe("my prompt4");
	});
	handler.hearCommand("/lol!", async ctx => {
		let { ctx: newCtx } = await ctx.ask();
		expect(newCtx.text).toBe("my prompt2");
		let answer = await ctx.ask({ condition: "my prompt3" });
		expect(answer.toString()).toBe("my prompt3");
	});

	handler.implementConversations();
	await Promise.all([
		handler.handle(baseUpdate),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "/lol" } })
		),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "my prompt" } })
		),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "my prompt2" } })
		),

		handler.handle(baseUpdate),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "/lol" } })
		),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "my prompt3" } })
		),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "my prompt4" } })
		),
	]);
});
test("should handle condition fallback", async () => {
	handler.hearCommand("/test", async ctx => {
		await ctx.ask({
			condition: "never be!",
			conditionFallback: async ctx => {
				expect(ctx.text).toBe("what?");
			},
		});
	});

	handler.implementConversations();
	await Promise.all([
		handler.handle(baseUpdate),
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "what?" } })
		),
	]);
});
test("should provide correct next()", async () => {
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
		handler.handle(
			Object.assign(baseUpdate, { message: { text: "i have" } })
		),
	]);
});
