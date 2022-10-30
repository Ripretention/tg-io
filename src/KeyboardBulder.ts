export type InlineButtonPressHandler = (evt: any) => Promise<any>
export class Button {
	private handlers = [];
	private payload = "";
	constructor(private readonly text: string) {}
}
