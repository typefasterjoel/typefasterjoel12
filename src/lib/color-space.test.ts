import { describe, expect, it } from "vitest";
import {
	contrastRatio,
	hexToRgb,
	mixOklab,
	oklabToOklch,
	oklabToRgb,
	oklchToOklab,
	relativeLuminance,
	rgbToHex,
	rgbToOklab,
	solveLuminanceForContrast,
} from "./color-space";

describe("hex/rgb", () => {
	it("parses and re-emits lowercase 6-digit hex", () => {
		expect(hexToRgb("#EFE6D2")).toEqual({ r: 239, g: 230, b: 210 });
		expect(rgbToHex({ r: 239, g: 230, b: 210 })).toBe("#efe6d2");
	});
});

describe("oklab", () => {
	it("maps pure white to L=1 with no chroma", () => {
		const lab = rgbToOklab({ r: 255, g: 255, b: 255 });
		expect(lab.L).toBeCloseTo(1, 2);
		expect(lab.a).toBeCloseTo(0, 3);
		expect(lab.b).toBeCloseTo(0, 3);
	});

	it("maps pure black to L=0", () => {
		expect(rgbToOklab({ r: 0, g: 0, b: 0 }).L).toBeCloseTo(0, 3);
	});

	it("round-trips a mid-tone within 1/255", () => {
		const rgb = { r: 126, g: 155, b: 180 };
		const back = oklabToRgb(rgbToOklab(rgb));
		expect(back.r).toBeCloseTo(rgb.r, 0);
		expect(back.g).toBeCloseTo(rgb.g, 0);
		expect(back.b).toBeCloseTo(rgb.b, 0);
	});

	it("interpolates blue to orange without passing through grey", () => {
		// The whole reason we are in OKLab: the sRGB midpoint of these two is
		// a desaturated mud. The OKLab midpoint must keep real chroma.
		const blue = rgbToOklab(hexToRgb("#2c3a56"));
		const orange = rgbToOklab(hexToRgb("#e38a52"));
		const mid = oklabToOklch(mixOklab(blue, orange, 0.5));
		expect(mid.C).toBeGreaterThan(0.02);
	});
});

describe("contrast", () => {
	it("gives 21:1 for black on white", () => {
		expect(
			contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }),
		).toBeCloseTo(21, 1);
	});

	it("gives 1:1 for a colour against itself", () => {
		const c = { r: 120, g: 90, b: 40 };
		expect(contrastRatio(c, c)).toBeCloseTo(1, 5);
	});

	it("computes luminance of mid-grey", () => {
		expect(relativeLuminance({ r: 128, g: 128, b: 128 })).toBeCloseTo(
			0.2159,
			3,
		);
	});
});

describe("solveLuminanceForContrast", () => {
	const dayGround = hexToRgb("#ede7da");

	it("darkens a too-light sun colour until it passes 4.5:1 on day ground", () => {
		const sun = oklabToOklch(rgbToOklab(hexToRgb("#fff7e0")));
		expect(
			contrastRatio(oklabToRgb(oklchToOklab(sun)), dayGround),
		).toBeLessThan(4.5);

		const solved = solveLuminanceForContrast(sun, dayGround, 4.5);
		const ratio = contrastRatio(oklabToRgb(oklchToOklab(solved)), dayGround);
		expect(ratio).toBeGreaterThanOrEqual(4.5);
	});

	it("preserves the hue it was given", () => {
		const sun = oklabToOklch(rgbToOklab(hexToRgb("#f2a75c")));
		const solved = solveLuminanceForContrast(sun, dayGround, 4.5);
		expect(solved.h).toBeCloseTo(sun.h, 1);
	});

	it("leaves a colour that already passes essentially alone", () => {
		const moon = oklabToOklch(rgbToOklab(hexToRgb("#c6d2e8")));
		const nightGround = hexToRgb("#101319");
		const solved = solveLuminanceForContrast(moon, nightGround, 4.5);
		expect(solved.L).toBeCloseTo(moon.L, 2);
	});

	it("returns an in-gamut colour", () => {
		const sun = oklabToOklch(rgbToOklab(hexToRgb("#fff7e0")));
		const solved = solveLuminanceForContrast(sun, dayGround, 4.5);
		const rgb = oklabToRgb(oklchToOklab(solved));
		for (const ch of [rgb.r, rgb.g, rgb.b]) {
			expect(ch).toBeGreaterThanOrEqual(0);
			expect(ch).toBeLessThanOrEqual(255);
		}
	});
});
