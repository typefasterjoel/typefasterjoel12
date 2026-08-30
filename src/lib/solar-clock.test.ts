import { describe, expect, it } from "vitest";
import {
	getSolarState,
	hoursFromDate,
	SOLAR_NOON_HOUR,
	type SolarHours,
	SUNRISE_HOUR,
	SUNSET_HOUR,
	solarStateAtHour,
} from "./solar-clock";

describe("solarStateAtHour — altitude", () => {
	it("sits at zero exactly at sunrise and sunset", () => {
		expect(solarStateAtHour(SUNRISE_HOUR).sunAltitude).toBeCloseTo(0, 5);
		expect(solarStateAtHour(SUNSET_HOUR).sunAltitude).toBeCloseTo(0, 5);
	});

	it("peaks at exactly 1 at solar noon", () => {
		expect(solarStateAtHour(SOLAR_NOON_HOUR).sunAltitude).toBeCloseTo(1, 5);
	});

	it("ramps as a quarter-sine either side of solar noon", () => {
		// NOTE: at the shipped constants this assertion does NOT prove the two
		// half-arcs are scaled independently — solar noon (13) lands exactly on
		// the midpoint of 06:00–20:00, so a single symmetric sine produces the
		// identical curve. See "asymmetric arcs" below for the test that does.
		const morningSpan = SOLAR_NOON_HOUR - SUNRISE_HOUR;
		const eveningSpan = SUNSET_HOUR - SOLAR_NOON_HOUR;

		expect(solarStateAtHour(SUNRISE_HOUR + 3).sunAltitude).toBeCloseTo(
			Math.sin((Math.PI / 2) * (3 / morningSpan)),
			5,
		);
		expect(solarStateAtHour(SUNSET_HOUR - 3).sunAltitude).toBeCloseTo(
			Math.sin((Math.PI / 2) * (3 / eveningSpan)),
			5,
		);
	});

	it("is negative through the night and bottoms out at -1", () => {
		expect(solarStateAtHour(23).sunAltitude).toBeLessThan(0);
		expect(solarStateAtHour(2).sunAltitude).toBeLessThan(0);
		// night span 20:00 -> 06:00 is 10h; midpoint is 01:00
		expect(solarStateAtHour(1).sunAltitude).toBeCloseTo(-1, 5);
	});

	it("stays within -1..1 at every minute of the day", () => {
		for (let m = 0; m < 1440; m++) {
			const a = solarStateAtHour(m / 60).sunAltitude;
			expect(a).toBeGreaterThanOrEqual(-1);
			expect(a).toBeLessThanOrEqual(1);
		}
	});
});

describe("solarStateAtHour — isNight", () => {
	it("is false during the day and true at night", () => {
		expect(solarStateAtHour(12).isNight).toBe(false);
		expect(solarStateAtHour(23).isNight).toBe(true);
		expect(solarStateAtHour(3).isNight).toBe(true);
	});

	it("flips at the sunrise and sunset boundaries", () => {
		expect(solarStateAtHour(SUNRISE_HOUR - 0.01).isNight).toBe(true);
		expect(solarStateAtHour(SUNRISE_HOUR + 0.01).isNight).toBe(false);
		expect(solarStateAtHour(SUNSET_HOUR - 0.01).isNight).toBe(false);
		expect(solarStateAtHour(SUNSET_HOUR + 0.01).isNight).toBe(true);
	});
});

describe("solarStateAtHour — azimuth", () => {
	it("sweeps -70 -> 0 -> +70 across the day", () => {
		expect(solarStateAtHour(SUNRISE_HOUR).azimuth).toBeCloseTo(-70, 3);
		expect(solarStateAtHour(SOLAR_NOON_HOUR).azimuth).toBeCloseTo(0, 3);
		expect(solarStateAtHour(SUNSET_HOUR).azimuth).toBeCloseTo(70, 3);
	});

	it("repeats the same sweep across the night for the moon", () => {
		expect(solarStateAtHour(SUNSET_HOUR + 0.001).azimuth).toBeCloseTo(-70, 1);
		expect(solarStateAtHour(SUNRISE_HOUR - 0.001).azimuth).toBeCloseTo(70, 1);
	});

	it("stays within -70..70 at every minute", () => {
		for (let m = 0; m < 1440; m++) {
			const az = solarStateAtHour(m / 60).azimuth;
			expect(az).toBeGreaterThanOrEqual(-70.001);
			expect(az).toBeLessThanOrEqual(70.001);
		}
	});
});

describe("solarStateAtHour — dayProgress", () => {
	it("is 0 at midnight, 0.5 at noon, and wraps below 1", () => {
		expect(solarStateAtHour(0).dayProgress).toBeCloseTo(0, 5);
		expect(solarStateAtHour(12).dayProgress).toBeCloseTo(0.5, 5);
		expect(solarStateAtHour(24).dayProgress).toBeCloseTo(0, 5);
	});
});

/**
 * The tests above all run at the shipped constants, where solar noon (13) is
 * also the midpoint of the 06:00–20:00 day. That coincidence makes the correct
 * two-half-arc implementation and a naive `sin(PI * (h - rise) / daySpan)`
 * numerically identical to within 5e-16 — every assertion above passes against
 * the wrong one. Moving solar noon off the midpoint is the only thing that
 * separates them, which is what `SolarHours` exists for.
 */
describe("solarStateAtHour — asymmetric arcs", () => {
	/** Day still 06:00–20:00, but the sun peaks at 10:00, not the 13:00 midpoint. */
	const EARLY_NOON: SolarHours = {
		sunriseHour: 6,
		solarNoonHour: 10,
		sunsetHour: 20,
	};

	it("moves the altitude peak to solar noon, not the midpoint of the day", () => {
		expect(solarStateAtHour(10, EARLY_NOON).sunAltitude).toBeCloseTo(1, 5);
		// A symmetric arc across 06:00–20:00 would peak here instead.
		expect(solarStateAtHour(13, EARLY_NOON).sunAltitude).toBeLessThan(0.95);
	});

	it("scales each half-arc by its OWN span", () => {
		// Morning span is 4h, so 08:00 is halfway up the short ramp.
		// A symmetric arc would read sin(PI * 2/14) = 0.434 here.
		expect(solarStateAtHour(8, EARLY_NOON).sunAltitude).toBeCloseTo(
			Math.sin(Math.PI / 4),
			5,
		);
		// Evening span is 10h, so 13:00 is 30% down the long ramp.
		expect(solarStateAtHour(13, EARLY_NOON).sunAltitude).toBeCloseTo(
			Math.sin((Math.PI / 2) * 0.7),
			5,
		);
	});

	it("puts the brightest minute of the day exactly at solar noon", () => {
		let brightest = -Infinity;
		let brightestMinute = -1;
		for (let m = 0; m < 1440; m++) {
			const a = solarStateAtHour(m / 60, EARLY_NOON).sunAltitude;
			if (a > brightest) {
				brightest = a;
				brightestMinute = m;
			}
		}
		expect(brightestMinute / 60).toBeCloseTo(EARLY_NOON.solarNoonHour, 5);
	});

	it("puts the overhead point of the azimuth sweep at solar noon too", () => {
		expect(solarStateAtHour(10, EARLY_NOON).azimuth).toBeCloseTo(0, 5);
		expect(solarStateAtHour(6, EARLY_NOON).azimuth).toBeCloseTo(-70, 5);
		expect(solarStateAtHour(20, EARLY_NOON).azimuth).toBeCloseTo(70, 5);
		// The day midpoint is no longer overhead.
		expect(solarStateAtHour(13, EARLY_NOON).azimuth).toBeGreaterThan(10);
	});
});

/**
 * The night arc is the one place the maths has to reason past 24:00. Dropping
 * the wrap makes `since` go negative after midnight, which collapses the whole
 * small-hours arc — these tests are written to catch exactly that.
 */
describe("solarStateAtHour — midnight wrap", () => {
	it("never jumps between adjacent minutes, midnight included", () => {
		let previous = solarStateAtHour(0).sunAltitude;
		let worst = 0;
		for (let m = 1; m <= 1440; m++) {
			const current = solarStateAtHour(m / 60).sunAltitude;
			worst = Math.max(worst, Math.abs(current - previous));
			previous = current;
		}
		// 1440 wraps back to 00:00, so this closes the loop across midnight.
		expect(worst).toBeLessThan(0.01);
	});

	it("falls to the bottom of the night and climbs back out again", () => {
		// 20:00 -> 01:00 the sun keeps sinking...
		for (let m = 20 * 60; m < 25 * 60; m++) {
			expect(solarStateAtHour((m + 1) / 60).sunAltitude).toBeLessThan(
				solarStateAtHour(m / 60).sunAltitude,
			);
		}
		// ...and 01:00 -> 06:00 it climbs back to the horizon.
		for (let m = 60; m < 6 * 60; m++) {
			expect(solarStateAtHour((m + 1) / 60).sunAltitude).toBeGreaterThan(
				solarStateAtHour(m / 60).sunAltitude,
			);
		}
	});

	it("wraps against whatever sunset hour it is given", () => {
		// Night runs 22:00 -> 05:00, a 7h span whose midpoint is 01:30.
		const LATE_SUNSET: SolarHours = {
			sunriseHour: 5,
			solarNoonHour: 12,
			sunsetHour: 22,
		};
		expect(solarStateAtHour(1.5, LATE_SUNSET).sunAltitude).toBeCloseTo(-1, 5);
		expect(solarStateAtHour(23, LATE_SUNSET).sunAltitude).toBeCloseTo(
			-Math.sin((Math.PI / 2) * (1 / 3.5)),
			5,
		);
		expect(solarStateAtHour(4, LATE_SUNSET).sunAltitude).toBeCloseTo(
			-Math.sin((Math.PI / 2) * (1 / 3.5)),
			5,
		);
	});
});

describe("hoursFromDate", () => {
	it("reads local hours, minutes and seconds as a fraction", () => {
		expect(hoursFromDate(new Date(2026, 7, 23, 0, 0, 0))).toBeCloseTo(0, 5);
		expect(hoursFromDate(new Date(2026, 7, 23, 6, 30, 0))).toBeCloseTo(6.5, 5);
		expect(hoursFromDate(new Date(2026, 7, 23, 23, 59, 36))).toBeCloseTo(
			23 + 59 / 60 + 36 / 3600,
			5,
		);
	});
});

describe("getSolarState", () => {
	it("reads the local hour off a Date", () => {
		const d = new Date(2026, 7, 23, SOLAR_NOON_HOUR, 0, 0);
		expect(getSolarState(d).sunAltitude).toBeCloseTo(1, 5);
	});

	it("treats 23:59 and 00:01 as adjacent, not as opposite ends", () => {
		const late = getSolarState(new Date(2026, 7, 23, 23, 59)).sunAltitude;
		const early = getSolarState(new Date(2026, 7, 24, 0, 1)).sunAltitude;
		expect(Math.abs(late - early)).toBeLessThan(0.05);
	});

	it("agrees with solarStateAtHour for the same local time", () => {
		const d = new Date(2026, 7, 23, 17, 45, 0);
		expect(getSolarState(d)).toEqual(solarStateAtHour(17.75));
	});
});
