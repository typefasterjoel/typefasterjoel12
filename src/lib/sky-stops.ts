/**
 * The six-stop sky colour ring and its interpolation.
 *
 * Sunrise and sunset get SEPARATE stops on purpose: dawn is cooler and pinker,
 * dusk warmer and oranger. One shared "twilight" stop would make the two
 * best-looking hours of the day identical.
 *
 * These values are starting points to be judged in the browser, not derived
 * truths. The Part 2 time scrubber exists partly so they can be tuned by eye
 * across the whole cycle in one sitting.
 */
import {
	hexToRgb,
	mixOklab,
	type Oklab,
	oklabToRgb,
	rgbToHex,
	rgbToOklab,
} from "#/lib/color-space";

export type SkyColors = { skyHigh: string; skyLow: string; light: string };

export type SkyStop = {
	readonly hour: number;
	readonly skyHigh: string;
	readonly skyLow: string;
	readonly light: string;
};

export const SKY_STOPS: ReadonlyArray<SkyStop> = [
	{ hour: 0, skyHigh: "#070b16", skyLow: "#101a30", light: "#c6d2e8" }, // midnight, moon
	{ hour: 5, skyHigh: "#16203a", skyLow: "#3e4a6b", light: "#9fb4d6" }, // astro dawn
	{ hour: 6.5, skyHigh: "#2c3a56", skyLow: "#f0b48c", light: "#ffdcb0" }, // sunrise
	{ hour: 13, skyHigh: "#7e9bb4", skyLow: "#efe6d2", light: "#fff7e0" }, // noon
	{ hour: 19.5, skyHigh: "#46395c", skyLow: "#e38a52", light: "#f2a75c" }, // sunset
	{ hour: 21, skyHigh: "#14182e", skyLow: "#2a2440", light: "#a8b4d0" }, // dusk end
];

const lab = (hex: string): Oklab => rgbToOklab(hexToRgb(hex));
const hex = (l: Oklab): string => rgbToHex(oklabToRgb(l));

/**
 * The pair of stops an hour sits between, plus the hours those stops are read
 * at. The ring's stops only ascend from 00:00 to 21:00, so the arc from the
 * final stop through midnight back to the first is the one case the ascending
 * scan cannot express: it is handled up front, not left to fall out of a
 * search that failed to match.
 */
function bracket(h: number): {
	lower: SkyStop;
	upper: SkyStop;
	lowerHour: number;
	upperHour: number;
} {
	const first = SKY_STOPS[0];
	const last = SKY_STOPS[SKY_STOPS.length - 1];

	for (let i = 0; i < SKY_STOPS.length - 1; i++) {
		const lower = SKY_STOPS[i];
		const upper = SKY_STOPS[i + 1];
		if (h >= lower.hour && h <= upper.hour) {
			return { lower, upper, lowerHour: lower.hour, upperHour: upper.hour };
		}
	}

	// Past the last stop: measure forward from it, with the first stop read as
	// tomorrow. Before the first stop: the same arc, with the last stop read as
	// yesterday. Both walk dusk end -> midnight in the same direction.
	return h < first.hour
		? {
				lower: last,
				upper: first,
				lowerHour: last.hour - 24,
				upperHour: first.hour,
			}
		: {
				lower: last,
				upper: first,
				lowerHour: last.hour,
				upperHour: first.hour + 24,
			};
}

export function skyColorsAtHour(hour: number): SkyColors {
	const h = ((hour % 24) + 24) % 24;
	const { lower, upper, lowerHour, upperHour } = bracket(h);

	const span = upperHour - lowerHour;
	const t = span === 0 ? 0 : (h - lowerHour) / span;

	return {
		skyHigh: hex(mixOklab(lab(lower.skyHigh), lab(upper.skyHigh), t)),
		skyLow: hex(mixOklab(lab(lower.skyLow), lab(upper.skyLow), t)),
		light: hex(mixOklab(lab(lower.light), lab(upper.light), t)),
	};
}
