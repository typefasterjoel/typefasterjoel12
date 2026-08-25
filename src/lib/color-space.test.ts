import { describe, expect, it } from "vitest";
import {
	contrastRatio,
	hexToRgb,
	mixOklab,
	type Oklch,
	oklabToOklch,
	oklabToRgb,
	oklchToOklab,
	type Rgb,
	relativeLuminance,
	rgbToHex,
	rgbToOklab,
	solveLuminanceForContrast,
} from "./color-space";

const ratioOf = (lch: Oklch, bg: Rgb) =>
	contrastRatio(oklabToRgb(oklchToOklab(lch)), bg);

/** What the colour actually becomes once it has been through sRGB. */
const afterSrgb = (lch: Oklch) =>
	oklabToOklch(rgbToOklab(oklabToRgb(oklchToOklab(lch))));

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

	it("interpolates blue to yellow without passing through grey", () => {
		// The whole reason we are in OKLab. Blue and yellow are chosen because
		// their sRGB midpoint is exactly neutral: an sRGB lerp cannot pass this
		// test, so it genuinely guards the "OKLab, never sRGB" constraint.
		const blue = rgbToOklab(hexToRgb("#0000ff"));
		const yellow = rgbToOklab(hexToRgb("#ffff00"));
		const mid = oklabToOklch(mixOklab(blue, yellow, 0.5));
		expect(mid.C).toBeGreaterThan(0.02);

		// Guard the guard: confirm the sRGB midpoint really is dead grey, so a
		// naive implementation lands at C = 0 and fails the assertion above.
		const srgbMid = oklabToOklch(rgbToOklab({ r: 127.5, g: 127.5, b: 127.5 }));
		expect(srgbMid.C).toBeLessThan(0.001);
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
	const nightGround = hexToRgb("#101319");

	it("darkens a too-light sun colour until it passes 4.5:1 on day ground", () => {
		const sun = oklabToOklch(rgbToOklab(hexToRgb("#fff7e0")));
		expect(ratioOf(sun, dayGround)).toBeLessThan(4.5);

		const solved = solveLuminanceForContrast(sun, dayGround, 4.5);
		expect(ratioOf(solved, dayGround)).toBeGreaterThanOrEqual(4.5);
		expect(solved.L).toBeLessThan(sun.L);
	});

	it("lightens a too-dark colour until it passes 4.5:1 on night ground", () => {
		// Exercises the lightening half of the solver: this starts at 2.34:1,
		// so it cannot take the early return.
		const ember = oklabToOklch(rgbToOklab(hexToRgb("#6b4a2a")));
		expect(ratioOf(ember, nightGround)).toBeLessThan(4.5);

		const solved = solveLuminanceForContrast(ember, nightGround, 4.5);
		expect(ratioOf(solved, nightGround)).toBeGreaterThanOrEqual(4.5);
		expect(solved.L).toBeGreaterThan(ember.L);
	});

	it("moves lightness no further than it has to, on either ground", () => {
		// Without this, a solver that simply returned black (or white) would
		// pass every other case here.
		const eps = 0.01;

		const sun = oklabToOklch(rgbToOklab(hexToRgb("#fff7e0")));
		const darkened = solveLuminanceForContrast(sun, dayGround, 4.5);
		// A hair back toward the original lightness must break the floor.
		expect(
			ratioOf({ ...darkened, L: darkened.L + eps }, dayGround),
		).toBeLessThan(4.5);

		const ember = oklabToOklch(rgbToOklab(hexToRgb("#6b4a2a")));
		const lightened = solveLuminanceForContrast(ember, nightGround, 4.5);
		expect(
			ratioOf({ ...lightened, L: lightened.L - eps }, nightGround),
		).toBeLessThan(4.5);
	});

	it("preserves the hue it was given", () => {
		const sun = oklabToOklch(rgbToOklab(hexToRgb("#f2a75c")));
		const solved = solveLuminanceForContrast(sun, dayGround, 4.5);
		expect(solved.h).toBeCloseTo(sun.h, 1);
	});

	it("leaves a colour that already passes essentially alone", () => {
		const moon = oklabToOklch(rgbToOklab(hexToRgb("#c6d2e8")));
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

	it("keeps all the chroma sRGB can hold at the solved lightness", () => {
		// The taper this replaced would have shed ~19% of this colour's chroma
		// at the solved lightness even though sRGB holds every bit of it.
		const ember = oklabToOklch(rgbToOklab(hexToRgb("#6b4a2a")));
		const solved = solveLuminanceForContrast(ember, nightGround, 4.5);
		expect(solved.C).toBeCloseTo(ember.C, 6);
	});

	it("sits at the gamut edge rather than inside it", () => {
		// A saturated hue that genuinely runs out of gamut when darkened. The
		// returned chroma must survive sRGB untouched, and a little more of it
		// must not — that is what "as much as sRGB allows" means.
		const sun = oklabToOklch(rgbToOklab(hexToRgb("#f2a75c")));
		const solved = solveLuminanceForContrast(sun, dayGround, 4.5);
		expect(solved.C).toBeLessThan(sun.C);

		const kept = afterSrgb(solved);
		expect(kept.C).toBeCloseTo(solved.C, 5);

		const overshot = { ...solved, C: solved.C + 0.01 };
		expect(afterSrgb(overshot).C).not.toBeCloseTo(overshot.C, 5);
	});

	it("never leaves a channel to be silently clamped", () => {
		// Clamping in fromLinear shifts hue, which is worse than losing chroma.
		// If nothing clamped, the colour survives the sRGB round trip exactly.
		const cases: Array<[string, Rgb]> = [
			["#fff7e0", dayGround],
			["#f2a75c", dayGround],
			["#c6d2e8", nightGround],
			["#6b4a2a", nightGround],
		];
		for (const [hex, ground] of cases) {
			const solved = solveLuminanceForContrast(
				oklabToOklch(rgbToOklab(hexToRgb(hex))),
				ground,
				4.5,
			);
			const kept = afterSrgb(solved);
			expect(kept.h).toBeCloseTo(solved.h, 3);
			expect(kept.C).toBeCloseTo(solved.C, 5);
			expect(kept.L).toBeCloseTo(solved.L, 5);
		}
	});
});
