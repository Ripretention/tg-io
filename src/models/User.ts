import {IUser} from "../types/IUser";
import {Entity} from "./Entity";

export class User extends Entity<IUser> {
	public readonly id = this.get("id");	
	public readonly firstname = this.get("first_name");
	public readonly lastname = this.get("last_name");
	public readonly username = this.get("username");
	public readonly code = this.get("language_code");

	public get appeal() {
		let username = this.username;
		if (username)
			username = "@" + username;

		return username ?? this.fullname;
	}
	public get isBot() {
		return this.get("is_bot") == true;
	}
	public get fullname() {
		let fullname = this.firstname;
		if (this.lastname)
			fullname += ` ${this.lastname}`;

		return fullname;
	}
}
