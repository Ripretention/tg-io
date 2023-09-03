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
	apiMock.addCallback("getUpdates", ({ offset }: { offset?: number }) => {
		if (offset === undefined) {
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
	apiMock.clear();

	apiMock.addCallback("getUpdates", ({ offset }: { offset?: number }) => {
		if (offset === undefined) {
			return Promise.resolve({
				ok: true,
				result: [{ update_id }, { update_id: update_id+1 }],
			} as IUpdateCollection);
		}
		expect(offset).toBe(update_id + 2);
		transport.stop();

		return Promise.resolve({
			ok: true,
			result: [],
		} as IUpdateCollection);
	});
	await transport.start(handler);
});
