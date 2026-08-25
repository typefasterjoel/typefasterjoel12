/**
 * Colour maths for the sky palette. Pure — no app knowledge, no DOM.
 *
 * OKLab is used for every interpolation and every luminance adjustment: it is
 * perceptually uniform, so mixing a blue sky stop with an orange one keeps its
 * chroma instead of passing through the grey mud that sRGB interpolation gives.
 * Matrices are Björn Ottosson's published sRGB <-> OKLab formulation.
 */

export type Rgb = { r: number; g: number; b: number };
export type Oklab = { L: number; a: number; b: number };
export type Oklch = { L: number; C: number; h: number };

const clamp = (v: number, lo: number, hi: number) =>
	v < lo ? lo : v > hi ? hi : v;

export function hexToRgb(hex: string): Rgb {
	const h = hex.replace("#", "").trim();
	if (h.length !== 6) throw new Error(`expected 6-digit hex, got "${hex}"`);
	return {
		r: Number.parseInt(h.slice(0, 2), 16),
		g: Number.parseInt(h.slice(2, 4), 16),
		b: Number.parseInt(h.slice(4, 6), 16),
	};
}

export function rgbToHex({ r, g, b }: Rgb): string {
	const to = (v: number) =>
		Math.round(clamp(v, 0, 255))
			.toString(16)
			.padStart(2, "0");
	return `#${to(r)}${to(g)}${to(b)}`;
}

/** sRGB transfer function, 0-255 -> linear 0-1. */
function toLinear(channel: number): number {
	const c = channel / 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Linear 0-1 -> sRGB 0-255. Clamps, so out-of-gamut input loses its hue. */
function fromLinear(c: number): number {
	const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
	return clamp(v * 255, 0, 255);
}

export function rgbToOklab(rgb: Rgb): Oklab {
	const r = toLinear(rgb.r);
	const g = toLinear(rgb.g);
	const b = toLinear(rgb.b);

	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);

	return {
		L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
		a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
		b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
	};
}

/**
 * OKLab -> linear sRGB, deliberately unclamped. A channel outside 0-1 means
 * the colour sits outside the sRGB gamut, which is exactly what the gamut
 * search below needs to know before `fromLinear` flattens the evidence.
 */
function oklabToLinearRgb(lab: Oklab): Rgb {
	const l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
	const m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
	const s_ = lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b;

	const l = l_ ** 3;
	const m = m_ ** 3;
	const s = s_ ** 3;

	return {
		r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	};
}

export function oklabToRgb(lab: Oklab): Rgb {
	const lin = oklabToLinearRgb(lab);
	return { r: fromLinear(lin.r), g: fromLinear(lin.g), b: fromLinear(lin.b) };
}

export function oklabToOklch(lab: Oklab): Oklch {
	const C = Math.hypot(lab.a, lab.b);
	let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
	if (h < 0) h += 360;
	return { L: lab.L, C, h };
}

export function oklchToOklab(lch: Oklch): Oklab {
	const rad = (lch.h * Math.PI) / 180;
	return { L: lch.L, a: Math.cos(rad) * lch.C, b: Math.sin(rad) * lch.C };
}

/**
 * Linear interpolation in OKLab. Mixing on the rectangular a/b axes rather
 * than on polar hue means a blue and an orange stop cross the neutral axis
 * instead of sweeping the whole hue circle, which is what a real sky does.
 */
export function mixOklab(a: Oklab, b: Oklab, t: number): Oklab {
	const u = clamp(t, 0, 1);
	return {
		L: a.L + (b.L - a.L) * u,
		a: a.a + (b.a - a.a) * u,
		b: a.b + (b.b - a.b) * u,
	};
}

export function relativeLuminance(rgb: Rgb): number {
	return (
		0.2126 * toLinear(rgb.r) +
		0.7152 * toLinear(rgb.g) +
		0.0722 * toLinear(rgb.b)
	);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const hi = Math.max(la, lb);
	const lo = Math.min(la, lb);
	return (hi + 0.05) / (lo + 0.05);
}

/**
 * True when every linear channel lands inside 0-1, so `fromLinear` will have
 * nothing to clip.
 *
 * The bounds are tested with no tolerance on purpose. Float error can only
 * push the answer a few ulps to the conservative side, costing chroma far
 * below one 8-bit step; any tolerance in the other direction would let a
 * channel out of gamut and hand `fromLinear` something to clip.
 */
function isInGamut(lch: Oklch): boolean {
	const { r, g, b } = oklabToLinearRgb(oklchToOklab(lch));
	const ok = (v: number) => v >= 0 && v <= 1;
	return ok(r) && ok(g) && ok(b);
}

/**
 * The most chroma sRGB will actually hold at this lightness and hue, never
 * more than `maxC`.
 *
 * For a fixed L and h the in-gamut chromas form the interval [0, Cmax], so a
 * binary search finds the edge. This is the real gamut clamp: it gives up
 * chroma only where the display genuinely cannot show it, instead of
 * discarding chroma on a guess. Any chroma past the edge would be silently
 * clipped by `fromLinear`, and clipping one channel shifts the hue — a
 * visibly wrong colour, which is worse than a slightly duller correct one.
 */
function chromaInGamut(L: number, h: number, maxC: number): number {
	if (maxC <= 0) return 0;
	if (isInGamut({ L, C: maxC, h })) return maxC;

	let lo = 0;
	let hi = maxC;
	for (let i = 0; i < 32; i++) {
		const mid = (lo + hi) / 2;
		if (isInGamut({ L, C: mid, h })) lo = mid;
		else hi = mid;
	}
	return lo;
}

/**
 * Keep a colour's hue; move its lightness the smallest distance that clears
 * `targetRatio` against `background`, then keep as much of its chroma as sRGB
 * genuinely allows at that lightness.
 *
 * Direction is chosen by the background: on a light ground we darken, on a
 * dark ground we lighten. Binary search on L converges in 24 iterations and is
 * far simpler to reason about than a closed form. The search always keeps the
 * *passing* bound nearest the original L, so the returned colour is the least
 * altered one that still meets the floor.
 */
export function solveLuminanceForContrast(
	hue: Oklch,
	background: Rgb,
	targetRatio: number,
): Oklch {
	const chromaAt = (L: number) => chromaInGamut(L, hue.h, hue.C);
	const ratioAt = (L: number, C: number) =>
		contrastRatio(oklabToRgb(oklchToOklab({ L, C, h: hue.h })), background);

	const startC = chromaAt(hue.L);
	if (ratioAt(hue.L, startC) >= targetRatio) {
		return { L: hue.L, C: startC, h: hue.h };
	}

	const bgIsLight = relativeLuminance(background) > 0.18;
	// Search between the starting L and the extreme in the darkening/lightening
	// direction. The extreme always passes for our contrast floors.
	let lo = bgIsLight ? 0 : hue.L;
	let hi = bgIsLight ? hue.L : 1;

	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2;
		if (ratioAt(mid, chromaAt(mid)) >= targetRatio) {
			// mid passes; move toward the original L to stay as close as possible
			if (bgIsLight) lo = mid;
			else hi = mid;
		} else {
			if (bgIsLight) hi = mid;
			else lo = mid;
		}
	}

	const L = bgIsLight ? lo : hi;
	return { L, C: chromaAt(L), h: hue.h };
}
