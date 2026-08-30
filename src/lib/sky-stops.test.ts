import { describe, expect, it } from "vitest";
import {
	contrastRatio,
	hexToRgb,
	mixOklab,
	oklabToOklch,
	oklabToRgb,
	type Rgb,
	rgbToHex,
	rgbToOklab,
} from "./color-space";
import { SKY_STOPS, skyColorsAtHour } from "./sky-stops";

const CHANNELS = ["skyHigh", "skyLow", "light"] as const;

const lab = (hex: string) => rgbToOklab(hexToRgb(hex));

/** Perceptual distance, the only honest way to say "these are close". */
const dist = (a: string, b: string) => {
	const la = lab(a);
	const lb = lab(b);
	return Math.hypot(la.L - lb.L, la.a - lb.a, la.b - lb.b);
};

/** What this module should produce. */
const mixInOklab = (a: string, b: string, t: number) =>
	rgbToHex(oklabToRgb(mixOklab(lab(a), lab(b), t)));

/** What the naive, banned implementation would produce. */
const mixInSrgb = (a: string, b: string, t: number) => {
	const ca = hexToRgb(a);
	const cb = hexToRgb(b);
	const ch = (x: number, y: number) => x + (y - x) * t;
	const mixed: Rgb = {
		r: ch(ca.r, cb.r),
		g: ch(ca.g, cb.g),
		b: ch(ca.b, cb.b),
	};
	return rgbToHex(mixed);
};

/** Every adjacent stop pair, including the one that wraps past midnight. */
const adjacentPairs = () => {
	const pairs: {
		lower: number;
		upper: number;
		lowerHour: number;
		upperHour: number;
	}[] = [];
	for (let i = 0; i < SKY_STOPS.length - 1; i++) {
		pairs.push({
			lower: i,
			upper: i + 1,
			lowerHour: SKY_STOPS[i].hour,
			upperHour: SKY_STOPS[i + 1].hour,
		});
	}
	pairs.push({
		lower: SKY_STOPS.length - 1,
		upper: 0,
		lowerHour: SKY_STOPS[SKY_STOPS.length - 1].hour,
		upperHour: SKY_STOPS[0].hour + 24,
	});
	return pairs;
};

describe("SKY_STOPS", () => {
	it("has six stops in ascending hour order", () => {
		expect(SKY_STOPS).toHaveLength(6);
		for (let i = 1; i < SKY_STOPS.length; i++) {
			expect(SKY_STOPS[i].hour).toBeGreaterThan(SKY_STOPS[i - 1].hour);
		}
	});

	it("gives sunrise and sunset DIFFERENT colours", () => {
		// Collapsing dawn and dusk into one "twilight" stop would make the two
		// most distinctive hours identical, which defeats the whole concept.
		const sunrise = SKY_STOPS.find((s) => s.hour === 6.5);
		const sunset = SKY_STOPS.find((s) => s.hour === 19.5);
		expect(sunrise).toBeDefined();
		expect(sunset).toBeDefined();
		expect(sunrise?.skyLow).not.toBe(sunset?.skyLow);
		expect(sunrise?.skyHigh).not.toBe(sunset?.skyHigh);
		expect(sunrise?.light).not.toBe(sunset?.light);
	});
});

describe("skyColorsAtHour", () => {
	it("returns every stop's own colours exactly at that stop's hour", () => {
		for (const stop of SKY_STOPS) {
			const got = skyColorsAtHour(stop.hour);
			for (const channel of CHANNELS) {
				expect(got[channel]).toBe(stop[channel]);
			}
		}
	});

	it("returns valid 6-digit hex at every minute of the day", () => {
		for (let m = 0; m < 1440; m++) {
			const c = skyColorsAtHour(m / 60);
			for (const v of [c.skyHigh, c.skyLow, c.light]) {
				expect(v).toMatch(/^#[0-9a-f]{6}$/);
			}
		}
	});

	it("normalises hours outside 0-24 onto the same ring", () => {
		expect(skyColorsAtHour(24)).toEqual(skyColorsAtHour(0));
		expect(skyColorsAtHour(26.5)).toEqual(skyColorsAtHour(2.5));
		expect(skyColorsAtHour(-1.5)).toEqual(skyColorsAtHour(22.5));
	});

	it("wraps continuously across midnight", () => {
		const before = skyColorsAtHour(23.99);
		const after = skyColorsAtHour(0.01);
		expect(dist(before.skyHigh, after.skyHigh)).toBeLessThan(0.02);
		expect(dist(before.skyLow, after.skyLow)).toBeLessThan(0.02);
		expect(dist(before.light, after.light)).toBeLessThan(0.02);
	});

	it("actually interpolates along the arc that wraps past midnight", () => {
		// The wrap is the one arc an ascending scan cannot express, so a broken
		// implementation tends to pin these hours to a stop instead of moving
		// between them. Continuity alone would not notice: 22:30 pinned to the
		// midnight colour is still perfectly smooth. So check the value is the
		// real midpoint, and is genuinely away from BOTH ends.
		const duskEnd = SKY_STOPS[SKY_STOPS.length - 1]; // 21:00
		const midnight = SKY_STOPS[0]; // 00:00
		const dawn = SKY_STOPS[1]; // 05:00

		const preMidnight = skyColorsAtHour(22.5); // halfway 21:00 -> 24:00
		const postMidnight = skyColorsAtHour(2.5); // halfway 00:00 -> 05:00

		for (const channel of CHANNELS) {
			expect(preMidnight[channel]).toBe(
				mixInOklab(duskEnd[channel], midnight[channel], 0.5),
			);
			expect(dist(preMidnight[channel], duskEnd[channel])).toBeGreaterThan(
				0.01,
			);
			expect(dist(preMidnight[channel], midnight[channel])).toBeGreaterThan(
				0.01,
			);

			expect(postMidnight[channel]).toBe(
				mixInOklab(midnight[channel], dawn[channel], 0.5),
			);
			expect(dist(postMidnight[channel], midnight[channel])).toBeGreaterThan(
				0.01,
			);
			expect(dist(postMidnight[channel], dawn[channel])).toBeGreaterThan(0.01);
		}
	});

	it("brackets every hour on the pair it actually sits between", () => {
		// Walks the whole ring at quarter-hour resolution and re-derives the
		// answer from the bracketing pair, so no hour can quietly be served by
		// the wrong stops.
		for (const pair of adjacentPairs()) {
			const lower = SKY_STOPS[pair.lower];
			const upper = SKY_STOPS[pair.upper];
			const span = pair.upperHour - pair.lowerHour;
			for (let step = 0; step <= span * 4; step++) {
				const t = step / (span * 4);
				const hour = pair.lowerHour + t * span;
				const got = skyColorsAtHour(hour);
				for (const channel of CHANNELS) {
					expect(got[channel]).toBe(
						mixInOklab(lower[channel], upper[channel], t),
					);
				}
			}
		}
	});

	it("never jumps sharply between adjacent minutes", () => {
		for (let m = 0; m < 1440; m++) {
			const a = skyColorsAtHour(m / 60);
			const b = skyColorsAtHour((m + 1) / 60);
			expect(dist(a.skyHigh, b.skyHigh)).toBeLessThan(0.02);
			expect(dist(a.skyLow, b.skyLow)).toBeLessThan(0.02);
			expect(dist(a.light, b.light)).toBeLessThan(0.02);
		}
	});

	it("mixes in OKLab, never in sRGB", () => {
		// A chroma floor on its own does NOT prove this. With these particular
		// stops the sRGB midpoint is sometimes the MORE saturated of the two
		// (19:30 -> 21:00 skyLow: sRGB C 0.068 vs OKLab C 0.059), so "C > 0.02"
		// passes against exactly the implementation it is meant to catch.
		// Instead: compute both candidate answers and require the OKLab one.
		let divergences = 0;
		for (const pair of adjacentPairs()) {
			const lower = SKY_STOPS[pair.lower];
			const upper = SKY_STOPS[pair.upper];
			for (const t of [0.25, 0.5, 0.75]) {
				const hour = pair.lowerHour + t * (pair.upperHour - pair.lowerHour);
				const got = skyColorsAtHour(hour);
				for (const channel of CHANNELS) {
					const inOklab = mixInOklab(lower[channel], upper[channel], t);
					const inSrgb = mixInSrgb(lower[channel], upper[channel], t);
					expect(got[channel]).toBe(inOklab);
					if (inOklab !== inSrgb) {
						divergences++;
						expect(got[channel]).not.toBe(inSrgb);
					}
				}
			}
		}
		// Guard against this test going hollow if the palette is ever retuned to
		// colours where both paths happen to agree everywhere.
		expect(divergences).toBeGreaterThan(0);
	});

	it("keeps real chroma at the dusk transition instead of going grey", () => {
		// A weaker sanity check than the test above (sRGB would also pass it
		// here), kept because "the sky went grey" is the visible symptom.
		const mid = skyColorsAtHour(20.25);
		const lch = oklabToOklch(lab(mid.skyLow));
		expect(lch.C).toBeGreaterThan(0.02);
	});

	it("makes night darker than noon", () => {
		const white = { r: 255, g: 255, b: 255 };
		const nightContrast = contrastRatio(
			hexToRgb(skyColorsAtHour(0).skyHigh),
			white,
		);
		const noonContrast = contrastRatio(
			hexToRgb(skyColorsAtHour(13).skyHigh),
			white,
		);
		expect(nightContrast).toBeGreaterThan(noonContrast);
	});
});
