import {IUser} from "../types/IUser";
import {Entity} from "./Entity";

export class User extends Entity<IUser> {
	public readonly id = this.get("id");	
	public readonly firstname = this.get("frist_name");
	public readonly lastname = this.get("last_name");
	public readonly username = this.get("username");

	public get fullname() {
		return this.firstname + (this.lastname ?? "");
	}
}
