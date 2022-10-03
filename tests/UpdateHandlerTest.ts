import { IUpdate } from "../src/types/IUpdate";
import { UpdateHandler } from "../src/UpdateHandler";
let handler: UpdateHandler; 

beforeEach(() => {
	handler = new UpdateHandler();
});
describe("onUpdate", () => {
	test("check correct work of next function in middleware", async () => {
		let handledUpdateCount = 0;
		let update: IUpdate = {
			update_id: 1,
			message: {},
		};
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
			update_id: 1,
			message: {},
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

});

