import {IChat} from "../types/IChat";
import {Entity} from "./Entity";

export class Chat extends Entity<IChat> {
	public readonly id = this.get("id");
	public readonly type = this.get("type");

	public get title() {
		return [this.get("title"), this.get("username")]
			.find(title => typeof title === "string" && title !== "");
	}
}
