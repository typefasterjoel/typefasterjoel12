import { describe, expect, it } from "vitest";
import { contrastRatio, hexToRgb } from "#/lib/color-space";
import { getPaletteAtHour } from "#/lib/sky-palette";

/**
 * A readable audit of the palette across the day. This does not test anything
 * the unit tests do not already cover — it exists so a human can eyeball the
 * numbers and the hexes at the four anchors before signing off.
 */
describe("palette audit", () => {
	it("prints the cycle and holds every contrast floor", () => {
		const rows: string[] = [];
		for (let h = 0; h < 24; h++) {
			const p = getPaletteAtHour(h);
			const g = hexToRgb(p.ground);
			const hh = h < 10 ? `0${h}` : `${h}`;
			rows.push(
				[
					`${hh}:00`,
					p.isNight ? "night" : "day  ",
					`sky ${p.skyHigh}->${p.skyLow}`,
					`light ${p.light}`,
					`accent ${p.accent}`,
					`a/g ${contrastRatio(hexToRgb(p.accent), g).toFixed(2)}`,
					`i/g ${contrastRatio(hexToRgb(p.ink), g).toFixed(2)}`,
					`opsz ${p.displayOpsz.toFixed(0)}`,
					`wght ${p.displayWght.toFixed(0)}`,
					`ang ${p.lightAngle.toFixed(0)}deg`,
				].join("  "),
			);
		}
		console.log(`\n${rows.join("\n")}\n`);

		for (let m = 0; m < 1440; m++) {
			const p = getPaletteAtHour(m / 60);
			const g = hexToRgb(p.ground);
			expect(contrastRatio(hexToRgb(p.accent), g)).toBeGreaterThanOrEqual(4.5);
			expect(contrastRatio(hexToRgb(p.ink), g)).toBeGreaterThanOrEqual(7);
			expect(contrastRatio(hexToRgb(p.accentStrong), g)).toBeGreaterThanOrEqual(
				3,
			);
		}
	});
});
