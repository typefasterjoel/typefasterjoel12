// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { SideQuest } from "#/data/side-quests";
import { SideQuestCard } from "./SideQuestCard";

afterEach(() => cleanup());

const quest: SideQuest = {
	slug: "test-quest",
	title: "Test Quest",
	blurb: "A short blurb about the quest.",
	tags: ["CLI", "AI tooling"],
	thumbnail: {
		src: "/work/test-quest/thumb.svg",
		alt: "Test Quest thumbnail",
		width: 800,
		height: 500,
	},
	links: [
		{ label: "View repo", href: "https://github.com/example/test-quest", kind: "repo" },
	],
};

describe("SideQuestCard", () => {
	it("renders the quest title, blurb, and thumbnail alt text", () => {
		render(<SideQuestCard quest={quest} onOpen={() => {}} />);
		expect(screen.getByText("Test Quest")).toBeTruthy();
		expect(screen.getByText(/short blurb/)).toBeTruthy();
		expect(screen.getByAltText("Test Quest thumbnail")).toBeTruthy();
	});

	it("calls onOpen with the quest and its bounding rect when clicked", () => {
		const captured: { value: { quest: SideQuest; rect: DOMRect } | null } = { value: null };
		render(
			<SideQuestCard
				quest={quest}
				onOpen={(q, rect) => {
					captured.value = { quest: q, rect };
				}}
			/>,
		);
		screen.getByRole("button", { name: /Test Quest/ }).click();
		expect(captured.value?.quest.slug).toBe("test-quest");
		expect(captured.value?.rect).toMatchObject({
			top: expect.any(Number),
			left: expect.any(Number),
			width: expect.any(Number),
			height: expect.any(Number),
		});
	});
});
