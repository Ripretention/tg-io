import { Polling } from "../src/transports";
import { IUpdate, IUpdateCollection } from "../src/types";
import { UpdateHandler } from "../src/UpdateHandler";
import { ApiMock } from "./utils/ApiMock";

const apiMock = new ApiMock();
const api = apiMock.get();
const handler = new UpdateHandler(api);
const transport = new Polling(api);

test("should correctly update offset", async () => {
	let update_id = 1;
	let initialResponseSent = false;
	apiMock.addCallback("getUpdates", ({ offset }: { offset?: number }) => {
		if (offset === undefined) {
			expect(initialResponseSent).toBe(false);
			initialResponseSent = true;
			return Promise.resolve({
				ok: true,
				result: [{ update_id }],
			} as IUpdateCollection);
		}
		expect(offset).toBe(update_id + 1);
		transport.stop();

		return Promise.resolve({
			ok: true,
			result: [],
		} as IUpdateCollection);
	});
	await transport.start(handler);
});
