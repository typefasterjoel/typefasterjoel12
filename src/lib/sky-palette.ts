/**
 * Assembles the complete CSS custom-property map for a given hour.
 *
 * The ground deliberately does NOT interpolate. A smooth stone->basalt fade
 * would pass through a mid-luminance window where neither dark nor light text
 * has acceptable contrast, so instead there are two states with a fast
 * crossfade at each terminator — the lamps come on at dusk. That makes the
 * contrast guarantee structural rather than something to re-verify per hour.
 */
import {
	contrastRatio,
	hexToRgb,
	mixOklab,
	type Oklch,
	oklabToOklch,
	oklabToRgb,
	oklchToOklab,
	rgbToHex,
	rgbToOklab,
	solveLuminanceForContrast,
} from "#/lib/color-space";
import { skyColorsAtHour } from "#/lib/sky-stops";
import { SUNRISE_HOUR, SUNSET_HOUR, solarStateAtHour } from "#/lib/solar-clock";

export const GROUND_DAY = "#ede7da";
export const INK_DAY = "#1a1815";
export const GROUND_NIGHT = "#101319";
export const INK_NIGHT = "#ece6da";

/** Width of each day<->night ground crossfade, in minutes. */
export const CROSSFADE_MINUTES = 20;

/** How much of the sky bleeds into the ground. Kept low so luminance holds. */
const SKY_TINT = 0.06;

const MAX_SHADOW_DIST = 48;
const MIN_SHADOW_DIST = 8;

/** How far past a contrast floor to aim, to survive rounding to 8-bit hex. */
const QUANTISATION_MARGIN = 0.05;

export type SkyPalette = {
	skyHigh: string;
	skyLow: string;
	light: string;
	ground: string;
	surface: string;
	surface2: string;
	border: string;
	borderStrong: string;
	ink: string;
	ink1: string;
	ink2: string;
	accent: string;
	accentStrong: string;
	onAccent: string;
	lightAngle: number;
	shadowDist: number;
	displayOpsz: number;
	displayWght: number;
	bodyWght: number;
	/** Which of the two ground states is showing. Follows the crossfade. */
	isNight: boolean;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t: number) => {
	const u = clamp01(t);
	return u * u * (3 - 2 * u);
};

/**
 * 0 = full day, 1 = full night. Flat across the middle of the day and the
 * middle of the night; all the movement is inside the two crossfade windows.
 */
export function nightness(hour: number): number {
	const h = ((hour % 24) + 24) % 24;
	const half = CROSSFADE_MINUTES / 2 / 60;

	// distance in hours to each terminator, signed so positive means "after"
	const afterSunset = h - SUNSET_HOUR;
	const afterSunrise = h - SUNRISE_HOUR;

	if (Math.abs(afterSunset) <= half) {
		return smoothstep((afterSunset + half) / (half * 2));
	}
	if (Math.abs(afterSunrise) <= half) {
		return 1 - smoothstep((afterSunrise + half) / (half * 2));
	}
	return h > SUNSET_HOUR || h < SUNRISE_HOUR ? 1 : 0;
}

/** Move a colour's lightness by `delta`, keeping hue and chroma. */
function shiftL(hex: string, delta: number): string {
	const lch = oklabToOklch(rgbToOklab(hexToRgb(hex)));
	const next: Oklch = { ...lch, L: clamp01(lch.L + delta) };
	return rgbToHex(oklabToRgb(oklchToOklab(next)));
}

/**
 * The accent IS the light source — but "#fff7e0 on pale stone" is invisible,
 * so we keep the sun's hue and chroma and solve only its lightness against the
 * current ground. At night, moonlight already passes and the two converge.
 *
 * This goes through the solver rather than `shiftL` on purpose: `shiftL` does
 * not clamp chroma to the sRGB gamut, which is harmless on the near-neutral
 * ground but silently clips a channel — and so shifts the hue — on a saturated
 * sun colour.
 *
 * Exported only so that guarantee can be tested directly. Sweeping the real
 * `SKY_STOPS` cannot prove it: the most saturated `--light` stop carries just
 * C=0.1272, and at that little chroma the gamut barely binds, so a
 * non-clamping implementation is nearly indistinguishable across the shipped
 * palette. The test feeds this a deliberately saturated colour instead, where
 * the difference is 80x. Not called from outside this module.
 */
export function accentFor(
	lightHex: string,
	groundHex: string,
	ratio: number,
): string {
	const lightRgb = hexToRgb(lightHex);
	const groundRgb = hexToRgb(groundHex);
	if (contrastRatio(lightRgb, groundRgb) >= ratio) return lightHex;

	const lch = oklabToOklch(rgbToOklab(lightRgb));
	let solved = lightHex;
	// The solver converges in continuous float RGB, but what ships is 8-bit
	// hex, and rounding to the nearest channel moves the colour back TOWARD the
	// ground — enough to drop a hair under the floor (measured worst case:
	// 4.469 against a 4.5 target). So aim past the floor by a margin, and
	// verify the QUANTISED colour, escalating if a stubborn hue still lands
	// short. Without this the invariant fails at 404 of 1440 minutes, all of
	// them by less than 0.04.
	for (let i = 1; i <= 8; i++) {
		const next = solveLuminanceForContrast(
			lch,
			groundRgb,
			ratio + QUANTISATION_MARGIN * i,
		);
		solved = rgbToHex(oklabToRgb(oklchToOklab(next)));
		if (contrastRatio(hexToRgb(solved), groundRgb) >= ratio) break;
	}
	return solved;
}

/** Black or white, whichever is readable on the given fill. */
function onFill(fillHex: string): string {
	const fill = hexToRgb(fillHex);
	const black = { r: 0, g: 0, b: 0 };
	const white = { r: 255, g: 255, b: 255 };
	return contrastRatio(black, fill) >= contrastRatio(white, fill)
		? "#000000"
		: "#ffffff";
}

export function getPaletteAtHour(hour: number): SkyPalette {
	const solar = solarStateAtHour(hour);
	const sky = skyColorsAtHour(hour);
	const n = nightness(hour);
	const isNight = n > 0.5;

	// Ground: pick a state, then tint it very slightly with the current sky.
	const baseGround = isNight ? GROUND_NIGHT : GROUND_DAY;
	const baseInk = isNight ? INK_NIGHT : INK_DAY;
	const groundLab = mixOklab(
		rgbToOklab(hexToRgb(baseGround)),
		rgbToOklab(hexToRgb(sky.skyLow)),
		SKY_TINT,
	);
	// Pin luminance back to the untinted ground so the tint moves hue only.
	const untinted = oklabToOklch(rgbToOklab(hexToRgb(baseGround)));
	const tinted = oklabToOklch(groundLab);
	const ground = rgbToHex(
		oklabToRgb(oklchToOklab({ ...tinted, L: untinted.L })),
	);

	// Surfaces and borders step away from the ground, direction set by state.
	const dir = isNight ? 1 : -1; // lift surfaces on night ground, sink on day
	const surface = shiftL(ground, dir * 0.03);
	const surface2 = shiftL(ground, dir * 0.06);
	const border = shiftL(ground, dir * 0.1);
	const borderStrong = shiftL(ground, dir * 0.18);

	// Ink steps TOWARD the ground. That is lighter on the day stone and darker
	// on the night basalt, so the sign has to follow the state — a single sign
	// reads fine in one state and destroys secondary text in the other.
	const inkDir = isNight ? -1 : 1;
	const ink = baseInk;
	const ink1 = shiftL(baseInk, inkDir * 0.16);
	const ink2 = shiftL(baseInk, inkDir * 0.3);

	// Solved once and reused for onAccent — the solve is a nested binary search,
	// so calling it twice for the same pair is pure waste.
	const accent = accentFor(sky.light, ground, 4.5);

	// Shadows lengthen as the sun drops, capped so they never run away.
	const shadowDist =
		MIN_SHADOW_DIST +
		(MAX_SHADOW_DIST - MIN_SHADOW_DIST) * (1 - Math.abs(solar.sunAltitude));

	return {
		skyHigh: sky.skyHigh,
		skyLow: sky.skyLow,
		light: sky.light,
		ground,
		surface,
		surface2,
		border,
		borderStrong,
		ink,
		ink1,
		ink2,
		accent,
		accentStrong: accentFor(sky.light, ground, 3),
		onAccent: onFill(accent),
		// Placeholder. The type axes are derived from the sun in Task 6.
		lightAngle: solar.azimuth,
		shadowDist,
		displayOpsz: 72,
		displayWght: 400,
		bodyWght: 400,
		isNight,
	};
}
