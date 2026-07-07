import { describe, expect, it } from "vitest";
import { computeFlipTransform } from "./flip";

describe("computeFlipTransform", () => {
	it("returns identity deltas when origin and target rects are the same", () => {
		const rect = { top: 100, left: 100, width: 200, height: 150 };
		expect(computeFlipTransform(rect, rect)).toEqual({
			x: 0,
			y: 0,
			scaleX: 1,
			scaleY: 1,
		});
	});

	it("computes the translate/scale to make a large centered target look like a small card", () => {
		// a small card near the top-left...
		const origin = { top: 40, left: 20, width: 100, height: 60 };
		// ...zooming into a larger, centered modal stage
		const target = { top: 200, left: 400, width: 600, height: 360 };
		const result = computeFlipTransform(origin, target);
		// origin center: (70, 70); target center: (700, 380)
		expect(result.x).toBeCloseTo(70 - 700);
		expect(result.y).toBeCloseTo(70 - 380);
		expect(result.scaleX).toBeCloseTo(100 / 600);
		expect(result.scaleY).toBeCloseTo(60 / 360);
	});
});
