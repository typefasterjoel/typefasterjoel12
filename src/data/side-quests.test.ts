import { describe, expect, it } from "vitest";
import { sideQuests } from "./side-quests";

describe("sideQuests", () => {
	it("excludes draft entries from the published list", () => {
		expect(sideQuests).toEqual([]);
	});

	it("never lets placeholder TODO copy leak through as published", () => {
		for (const quest of sideQuests) {
			expect(quest.title).not.toMatch(/TODO/);
			expect(quest.blurb).not.toMatch(/TODO/);
		}
	});
});
