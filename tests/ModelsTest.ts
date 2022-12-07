import {User} from "../src/models";
import {IUser} from "../src/types";

describe("user model", () => {
	let rawUser: IUser = {
		id: 1,
		first_name: "Pavel",
		is_bot: false,
		language_code: "en",
		last_name: "Durov",
		username: "durov"
	};

	test("should return a correct appeal (username)", () => {
		let user = new User(rawUser);
		
		let result = user.appeal;

		expect(result).toBe("@durov");
	});
	test("should return a correct appeal (fullname)", () => {
		rawUser.username = null;
		let user = new User(rawUser);
		
		let result = user.appeal;

		expect(result).toBe("Pavel Durov");
	});
	test("should return a correct appeal (firstname)", () => {
		rawUser.username = null;
		rawUser.last_name = null;
		let user = new User(rawUser);
		
		let result = user.appeal;

		expect(result).toBe("Pavel");
	});
});
