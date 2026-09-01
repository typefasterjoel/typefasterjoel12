import { describe, expect, it } from "vitest";
import { getProject, projects } from "#/data/projects";

/**
 * The hero's featured band renders straight from projects.ts. These guard the
 * coupling: the hero asks for "blueprint" by slug, and if that ever stops
 * resolving the hero silently loses its centrepiece.
 */
describe("the hero's featured project", () => {
	it("resolves blueprint and is not draft-gated", () => {
		const blueprint = getProject("blueprint");
		expect(blueprint).toBeDefined();
		expect(blueprint?.draft).not.toBe(true);
	});

	it("carries the hook and figure the band needs", () => {
		const featured = getProject("blueprint")?.featured;
		expect(featured?.hook).toBeTruthy();
		expect(featured?.figure.src).toMatch(/^\/work\/blueprint\//);
		// Alt text is not optional on the LCP image.
		expect(featured?.figure.alt.length).toBeGreaterThan(0);
	});

	it("carries the three stats the band lays out in a row", () => {
		expect(getProject("blueprint")?.stats).toHaveLength(3);
	});

	it("promotes exactly one project, since the hero has one band", () => {
		expect(projects.filter((p) => p.featured)).toHaveLength(1);
	});
});
