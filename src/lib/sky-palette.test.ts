import { describe, expect, it } from "vitest";
import {
	contrastRatio,
	hexToRgb,
	oklabToOklch,
	relativeLuminance,
	rgbToOklab,
} from "./color-space";
import {
	CROSSFADE_MINUTES,
	GROUND_DAY,
	GROUND_NIGHT,
	getPaletteAtHour,
	INK_DAY,
	INK_NIGHT,
	nightness,
} from "./sky-palette";
import { skyColorsAtHour } from "./sky-stops";
import { SUNRISE_HOUR, SUNSET_HOUR } from "./solar-clock";

const lab = (hex: string) => rgbToOklab(hexToRgb(hex));
/** Perceptual lightness — the axis every step in this module moves along. */
const lightness = (hex: string) => lab(hex).L;
const luminance = (hex: string) => relativeLuminance(hexToRgb(hex));
const ratio = (a: string, b: string) => contrastRatio(hexToRgb(a), hexToRgb(b));

describe("nightness", () => {
	it("is 0 in full daylight and 1 in the dead of night", () => {
		expect(nightness(13)).toBeCloseTo(0, 5);
		expect(nightness(1)).toBeCloseTo(1, 5);
	});

	it("is 0.5 exactly at each terminator", () => {
		expect(nightness(SUNRISE_HOUR)).toBeCloseTo(0.5, 2);
		expect(nightness(SUNSET_HOUR)).toBeCloseTo(0.5, 2);
	});

	it("completes each crossfade within its declared window", () => {
		const half = CROSSFADE_MINUTES / 2 / 60;
		expect(nightness(SUNSET_HOUR - half - 0.01)).toBeCloseTo(0, 3);
		expect(nightness(SUNSET_HOUR + half + 0.01)).toBeCloseTo(1, 3);
		expect(nightness(SUNRISE_HOUR - half - 0.01)).toBeCloseTo(1, 3);
		expect(nightness(SUNRISE_HOUR + half + 0.01)).toBeCloseTo(0, 3);
	});

	it("stays flat through the whole middle of the day", () => {
		// The ground must NOT drift continuously — that is the entire point of
		// having two states. Anything between the crossfades is pinned.
		for (let h = 8; h <= 18; h += 0.5) {
			expect(nightness(h)).toBeCloseTo(0, 4);
		}
	});

	it("stays flat through the whole middle of the night", () => {
		// The night half needs the same guarantee, and it is the half that wraps
		// midnight — the place a naive distance-to-terminator ramp goes wrong.
		for (let h = 20.5; h <= 29.5; h += 0.5) {
			expect(nightness(h)).toBeCloseTo(1, 4);
		}
	});

	it("moves monotonically across each crossfade window", () => {
		const half = CROSSFADE_MINUTES / 2 / 60;
		const sweep = (centre: number, direction: 1 | -1) => {
			let prev = nightness(centre - half);
			for (let i = 1; i <= 40; i++) {
				const v = nightness(centre - half + (i / 40) * half * 2);
				expect((v - prev) * direction).toBeGreaterThanOrEqual(-1e-12);
				prev = v;
			}
		};
		sweep(SUNSET_HOUR, 1);
		sweep(SUNRISE_HOUR, -1);
	});

	it("is defined and in range for hours outside 0-24", () => {
		for (const h of [-3, 25, 48.5]) {
			const n = nightness(h);
			expect(n).toBeGreaterThanOrEqual(0);
			expect(n).toBeLessThanOrEqual(1);
			expect(n).toBeCloseTo(nightness(((h % 24) + 24) % 24), 6);
		}
	});
});

describe("ground", () => {
	it("is the day stone in daylight and the night basalt after dark", () => {
		// Tinted by the sky, so it is never the literal constant — but the tint
		// is hue-only, so perceptual lightness must land on the constant's.
		// Asserted in OKLab L rather than luminance: at night the luminances are
		// all so small that "close" is true of every dark colour, so a stub
		// returning pure black would sail through a luminance comparison.
		expect(
			Math.abs(lightness(getPaletteAtHour(13).ground) - lightness(GROUND_DAY)),
		).toBeLessThan(0.002);
		expect(
			Math.abs(lightness(getPaletteAtHour(1).ground) - lightness(GROUND_NIGHT)),
		).toBeLessThan(0.002);
	});

	it("never sits in the unreadable mid-luminance band", () => {
		// The reason the ground has two states: a smooth stone->basalt fade
		// would pass through a window where NEITHER dark nor light ink works.
		for (let m = 0; m < 1440; m++) {
			const L = luminance(getPaletteAtHour(m / 60).ground);
			expect(L < 0.16 || L > 0.5).toBe(true);
		}
	});

	it("takes only a slight tint from the sky", () => {
		// <=6% mix: hue moves, luminance essentially does not.
		for (const h of [8, 11, 13, 16, 18]) {
			expect(
				Math.abs(luminance(getPaletteAtHour(h).ground) - luminance(GROUND_DAY)),
			).toBeLessThan(0.01);
		}
		for (const h of [0, 2, 22]) {
			expect(
				Math.abs(
					luminance(getPaletteAtHour(h).ground) - luminance(GROUND_NIGHT),
				),
			).toBeLessThan(0.01);
		}
	});

	it("actually takes that tint, and takes it from the sky", () => {
		// Luminance bounds alone are satisfied by a ground that ignores the sky
		// completely. The tint has to be visible on the chroma plane, and it has
		// to point at the sky rather than anywhere else.
		for (const h of [0, 2, 7, 17, 19, 21]) {
			const p = getPaletteAtHour(h);
			const base = lab(p.isNight ? GROUND_NIGHT : GROUND_DAY);
			const ground = lab(p.ground);
			const sky = lab(p.skyLow);
			const moved = { a: ground.a - base.a, b: ground.b - base.b };
			const toward = { a: sky.a - base.a, b: sky.b - base.b };
			expect(Math.hypot(moved.a, moved.b)).toBeGreaterThan(0.001);
			expect(moved.a * toward.a + moved.b * toward.b).toBeGreaterThan(0);
		}
	});

	it("flags night in step with the ground state", () => {
		expect(getPaletteAtHour(13).isNight).toBe(false);
		expect(getPaletteAtHour(1).isNight).toBe(true);
		expect(getPaletteAtHour(SUNSET_HOUR + 1).isNight).toBe(true);
		expect(getPaletteAtHour(SUNRISE_HOUR + 1).isNight).toBe(false);
	});

	it("keeps isNight and the ground colour agreeing at every minute", () => {
		// isNight is what Task 10 hangs the whole document state on. If it ever
		// disagrees with the ground actually being painted, the page renders
		// dark ink on dark stone.
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			expect(luminance(p.ground) < 0.16).toBe(p.isNight);
		}
	});
});

describe("ink", () => {
	it("clears 7:1 against the ground at every minute of the day", () => {
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			expect(ratio(p.ink, p.ground)).toBeGreaterThanOrEqual(7);
		}
	});

	it("is the declared ink for whichever ground is showing", () => {
		expect(getPaletteAtHour(13).ink).toBe(INK_DAY);
		expect(getPaletteAtHour(1).ink).toBe(INK_NIGHT);
	});

	it("steps ink1 and ink2 toward the ground, in both states", () => {
		for (const h of [13, 1]) {
			const p = getPaletteAtHour(h);
			const d = (c: string) => ratio(c, p.ground);
			// Direction, not just ordering: on day ground the steps lighten, on
			// night ground they darken. One shared sign passes on one state and
			// silently ruins the other.
			const sign = p.isNight ? -1 : 1;
			expect(Math.sign(lightness(p.ink1) - lightness(p.ink))).toBe(sign);
			expect(Math.sign(lightness(p.ink2) - lightness(p.ink1))).toBe(sign);

			expect(d(p.ink)).toBeGreaterThan(d(p.ink1));
			expect(d(p.ink1)).toBeGreaterThan(d(p.ink2));
			// secondary text must still be comfortably readable
			expect(d(p.ink1)).toBeGreaterThanOrEqual(4.5);
			expect(d(p.ink2)).toBeGreaterThanOrEqual(3);
		}
	});

	it("holds the ink1/ink2 floors at every minute, not just the two extremes", () => {
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			expect(ratio(p.ink1, p.ground)).toBeGreaterThanOrEqual(4.5);
			expect(ratio(p.ink2, p.ground)).toBeGreaterThanOrEqual(3);
		}
	});
});

describe("surfaces and borders", () => {
	it("steps surfaces away from the ground without crossing it", () => {
		for (const h of [13, 1]) {
			const p = getPaletteAtHour(h);
			const g = lightness(p.ground);
			// Lift surfaces off night basalt, sink them into day stone.
			const sign = p.isNight ? 1 : -1;
			expect(p.surface).not.toBe(p.ground);
			expect(p.surface2).not.toBe(p.surface);
			expect(Math.sign(lightness(p.surface) - g)).toBe(sign);
			expect(Math.sign(lightness(p.surface2) - g)).toBe(sign);
			expect(Math.abs(lightness(p.surface2) - g)).toBeGreaterThan(
				Math.abs(lightness(p.surface) - g),
			);
			// A surface, not a slab: it must stay quieter than a border.
			expect(ratio(p.surface2, p.ground)).toBeLessThan(
				ratio(p.border, p.ground),
			);
		}
	});

	it("keeps borders visible against the ground in both states", () => {
		for (const h of [13, 1]) {
			const p = getPaletteAtHour(h);
			const g = lightness(p.ground);
			const sign = p.isNight ? 1 : -1;
			const r = ratio(p.border, p.ground);
			const strong = ratio(p.borderStrong, p.ground);
			// Same side of the ground as the surfaces — a border that jumps the
			// other way reads as a highlight, and can clear a ratio floor by
			// accident while looking completely wrong.
			expect(Math.sign(lightness(p.border) - g)).toBe(sign);
			expect(Math.sign(lightness(p.borderStrong) - g)).toBe(sign);
			expect(r).toBeGreaterThan(1.1);
			expect(strong).toBeGreaterThan(r);
			// Still a rule, not a line of text.
			expect(strong).toBeLessThan(4.5);
		}
	});
});

describe("light angle and shadow distance", () => {
	it("tracks the sun's azimuth", () => {
		expect(getPaletteAtHour(13).lightAngle).toBeCloseTo(0, 3);
		expect(getPaletteAtHour(SUNRISE_HOUR).lightAngle).toBeCloseTo(-70, 3);
		expect(getPaletteAtHour(SUNSET_HOUR).lightAngle).toBeCloseTo(70, 3);
	});

	it("sweeps the angle in one direction across the day", () => {
		let prev = getPaletteAtHour(SUNRISE_HOUR).lightAngle;
		for (let m = 1; m <= (SUNSET_HOUR - SUNRISE_HOUR) * 60; m++) {
			const a = getPaletteAtHour(SUNRISE_HOUR + m / 60).lightAngle;
			expect(a).toBeGreaterThan(prev);
			prev = a;
		}
	});

	it("lengthens shadows as the sun drops", () => {
		const noon = getPaletteAtHour(13).shadowDist;
		const low = getPaletteAtHour(SUNSET_HOUR - 0.5).shadowDist;
		expect(low).toBeGreaterThan(noon);
	});

	it("bottoms out when the sun is highest and tops out at the terminators", () => {
		// Pins the ends of the ramp. Without this, any monotone-ish function of
		// the hour — even one with nothing to do with the sun — passes the two
		// tests either side of it.
		expect(getPaletteAtHour(13).shadowDist).toBeCloseTo(8, 6);
		expect(getPaletteAtHour(1).shadowDist).toBeCloseTo(8, 6);
		expect(getPaletteAtHour(SUNRISE_HOUR).shadowDist).toBeCloseTo(48, 6);
		expect(getPaletteAtHour(SUNSET_HOUR).shadowDist).toBeCloseTo(48, 6);
	});

	it("caps shadow distance so it never runs away", () => {
		for (let m = 0; m < 1440; m++) {
			const d = getPaletteAtHour(m / 60).shadowDist;
			expect(d).toBeGreaterThan(0);
			expect(d).toBeLessThanOrEqual(48);
		}
	});
});

describe("output shape", () => {
	const colourKeys = [
		"skyHigh",
		"skyLow",
		"light",
		"ground",
		"surface",
		"surface2",
		"border",
		"borderStrong",
		"ink",
		"ink1",
		"ink2",
	] as const;

	it("returns valid hex for every colour field at every minute", () => {
		for (let m = 0; m < 1440; m += 7) {
			const p = getPaletteAtHour(m / 60);
			for (const k of colourKeys) {
				expect(p[k]).toMatch(/^#[0-9a-f]{6}$/);
			}
		}
	});

	it("passes the sky straight through", () => {
		// The sky stops are already the truth; the palette must not re-derive or
		// re-tint them on the way out.
		for (const h of [3, 9, 13, 19.5, 22]) {
			const p = getPaletteAtHour(h);
			const sky = skyColorsAtHour(h);
			expect(p.skyHigh).toBe(sky.skyHigh);
			expect(p.skyLow).toBe(sky.skyLow);
			expect(p.light).toBe(sky.light);
		}
	});

	it("wraps the clock", () => {
		expect(getPaletteAtHour(25)).toEqual(getPaletteAtHour(1));
		expect(getPaletteAtHour(-2)).toEqual(getPaletteAtHour(22));
	});
});

describe("accent — the light source, made legible", () => {
	it("clears 4.5:1 on the ground at every minute of the day", () => {
		// THE headline invariant of the whole design. If this fails, the
		// palette is not shippable at that hour.
		const failures: string[] = [];
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			const r = contrastRatio(hexToRgb(p.accent), hexToRgb(p.ground));
			if (r < 4.5) {
				const hh = String(Math.floor(m / 60)).padStart(2, "0");
				const mm = String(m % 60).padStart(2, "0");
				failures.push(
					`${hh}:${mm} ratio=${r.toFixed(2)} accent=${p.accent} ground=${p.ground}`,
				);
			}
		}
		expect(failures).toEqual([]);
	});

	it("clears 3:1 for accentStrong at every minute", () => {
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			expect(
				contrastRatio(hexToRgb(p.accentStrong), hexToRgb(p.ground)),
			).toBeGreaterThanOrEqual(3);
		}
	});

	it("keeps the sun's hue and chroma — the accent is recognisably the light", () => {
		// Swept across every minute, not sampled at a few hand-picked hours: a
		// solve that drifts does it at the saturated hours, and four samples
		// walk straight past them. Chroma is asserted alongside hue because
		// only lightness is supposed to move — an accent that keeps the hue but
		// washes the colour out is no longer the light source either.
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			const light = oklabToOklch(rgbToOklab(hexToRgb(p.light)));
			const accent = oklabToOklch(rgbToOklab(hexToRgb(p.accent)));

			// within 12 degrees; gamut clamping can nudge hue slightly
			const delta = Math.abs(((light.h - accent.h + 540) % 360) - 180);
			expect(delta).toBeLessThan(12);

			// The gamut boundary legitimately costs a little chroma at low
			// lightness, but only a little. Anything that clips channels in sRGB
			// instead of clamping chroma in OKLab loses far more than this.
			if (light.C > 0.02) {
				expect(accent.C / light.C).toBeGreaterThan(0.8);
			}
		}
	});

	it("makes accentStrong a real second tier, nearer the light than accent", () => {
		// accentStrong only owes 3:1, so it gets to stay closer to the sun
		// colour. Reusing the 4.5:1 solve for both would satisfy every contrast
		// floor in this file while quietly collapsing the palette to one accent.
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			const toLight = (c: string) =>
				Math.abs(
					oklabToOklch(rgbToOklab(hexToRgb(c))).L -
						oklabToOklch(rgbToOklab(hexToRgb(p.light))).L,
				);

			if (p.accent === p.light) {
				// night: the light already clears both floors, so they converge
				expect(p.accentStrong).toBe(p.light);
				continue;
			}
			expect(p.accentStrong).not.toBe(p.accent);
			expect(toLight(p.accentStrong)).toBeLessThan(toLight(p.accent));
			// and it must be the quieter of the two against the ground
			expect(ratio(p.accentStrong, p.ground)).toBeLessThan(
				ratio(p.accent, p.ground),
			);
		}
	});

	it("does NOT equal --light during the day", () => {
		// #fff7e0 on pale stone is invisible; that is why accent exists.
		expect(getPaletteAtHour(13).accent).not.toBe(getPaletteAtHour(13).light);
	});

	it("converges with --light at night, where moonlight already passes", () => {
		const p = getPaletteAtHour(1);
		const r = contrastRatio(hexToRgb(p.light), hexToRgb(p.ground));
		expect(r).toBeGreaterThanOrEqual(4.5);
		expect(p.accent).toBe(p.light);
	});

	it("picks an onAccent that is readable on the accent fill", () => {
		for (let m = 0; m < 1440; m += 11) {
			const p = getPaletteAtHour(m / 60);
			expect(
				contrastRatio(hexToRgb(p.onAccent), hexToRgb(p.accent)),
			).toBeGreaterThanOrEqual(4.5);
		}
	});

	it("moves smoothly — no visible accent jump between adjacent minutes", () => {
		// The two ground crossfades are the only allowed discontinuities, and
		// even they must not be violent. They are unavoidable: on day stone the
		// accent has to be dark and on night basalt it has to be light, so the
		// polarity inverts the instant the ground state flips. Everywhere else
		// the accent must glide.
		const jumps: number[] = [];
		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			const q = getPaletteAtHour((m + 1) / 60);
			const a = rgbToOklab(hexToRgb(p.accent));
			const b = rgbToOklab(hexToRgb(q.accent));
			const d = Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);

			if (p.isNight !== q.isNight) {
				jumps.push(m);
				// the lamps coming on, not a strobe
				expect(d).toBeLessThan(0.4);
			} else {
				expect(d).toBeLessThan(0.06);
			}
		}
		// Exactly two, and only at the terminators. Without this the exemption
		// above would excuse an accent that lurched all day long.
		expect(jumps).toHaveLength(2);
	});
});
