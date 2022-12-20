import {MessageBuilder} from "../src/builders/";

describe("basic message building", () => {
	test("should build message with bold elements", () => {
		let text = "test text"; 
		let params = MessageBuilder.build(f => f.bold(text));

		expect(params).toStrictEqual({
			text: text,
			entities: [{
				type: "bold",
				length: text.length,
				offset: 0
			}]
		});
	});
	test("should build message with italic elements", () => {
		let text = "text is test"; 
		let params = MessageBuilder.build(f => f.italic(text));

		expect(params).toStrictEqual({
			text,
			entities: [{
				type: "italic",
				length: text.length,
				offset: 0
			}]
		});
	});
	test("should build message with a pre element", () => {
		let text = "fn x = x + 1";
		let params = MessageBuilder.build(f => f.pre(text, "haskell"));

		expect(params).toStrictEqual({
			text,
			entities: [{
				type: "pre",
				length: text.length,
				language: "haskell",
				offset: 0
			}]
		});
	});
});
describe("complex message building", () => {
	test("should build message witch bold and italic elements", () => {
		let params = MessageBuilder.build(f => 
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

	test("should build message with code, italic, bold, spoler elements", () => {
		let params = MessageBuilder.build(f => [f.code, f.italic, f.bold, f.spoiler]
			.reduce((acc, v) => v.bind(f)(acc), "text")
		);

		expect(params).toStrictEqual({
			text: "text",
			entities: ["code", "italic", "bold", "spoiler"].reduce((acc, type) => acc.concat({ 
				type,
				length: 4,
				offset: 0
			}), [])
		});
	});
});
describe("concatenations", () => {
	test("should connect two message correctly", () => {
		let firstEntity = MessageBuilder.build(f => `i am ${f.bold("first")}!\n`);
		let secondEntity = MessageBuilder.build(f => `i am ${f.italic("second")}!`);

		let result = MessageBuilder.concat(firstEntity, secondEntity);

		expect(result).toStrictEqual({
			text: "i am first!\ni am second!",
			entities: [{
				type: "bold",
				length: 5,
				offset: 5
			}, {
				type: "italic",
				length: 6,
				offset: 17 
			}]
		});
	});
});
