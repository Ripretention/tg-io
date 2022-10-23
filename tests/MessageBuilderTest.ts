import {MessageBuilder} from "../src/MessageBuilder";

describe("basic message entities", () => {
	test("should return params with bold entity", () => {
		let text = "test text"; 
		let params =  MessageBuilder.build(f => f.bold(text));

		expect(params).toStrictEqual({
			text: text,
			entities: [{
				type: "bold",
				length: text.length,
				offset: 0
			}]
		});
	});
	test("should return params with italic entity", () => {
		let text = "text is test"; 
		let params =  MessageBuilder.build(f => f.italic(text));

		expect(params).toStrictEqual({
			text: text,
			entities: [{
				type: "italic",
				length: text.length,
				offset: 0
			}]
		});
	});
});
describe("comples structure of message entities", () => {
	test("should return bold plus italic text", () => {
		let params =  MessageBuilder.build(f => 
			`${f.bold("bold")} but ${f.italic("italic")}`
		);

		expect(params).toStrictEqual({
			text: "bold but italic",
			entities: [{
				type: "bold",
				length: 4,
				offset: 0
			}, {
				type: "italic",
				length: 6,
				offset: 9
			}]
		});
	});
});

test("build test", () => {
	
});
