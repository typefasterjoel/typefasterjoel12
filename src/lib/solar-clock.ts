/**
 * The site's only source of truth for "what time is it, and where is the light".
 *
 * Deliberately NOT astronomical: sunrise and sunset are fixed constants read
 * against the visitor's local device clock. Real solar position would need
 * geolocation or an IP lookup — a permission prompt, a dependency, and a
 * denial path — to buy seasonal accuracy the concept does not need. The payoff
 * is "the site looks different depending on when you show up", and fixed hours
 * deliver that with zero privacy surface.
 */

export const SUNRISE_HOUR = 6;
export const SUNSET_HOUR = 20;
export const SOLAR_NOON_HOUR = 13;

/** Peak azimuth swing either side of overhead, in degrees. */
const AZIMUTH_EXTENT = 70;

/**
 * The three hours the arc is built from.
 *
 * Exposed as a parameter purely so the shape of the maths stays testable. At
 * the default constants solar noon happens to land on the midpoint of the day
 * (06:00–20:00 → 13:00), which makes a correct two-half-arc and a naive single
 * symmetric sine numerically identical — no test at fixed constants can tell
 * them apart. Moving solar noon off the midpoint separates them immediately.
 * Production code should never pass this; it always wants the constants above.
 */
export type SolarHours = {
	sunriseHour: number;
	solarNoonHour: number;
	sunsetHour: number;
};

export const DEFAULT_SOLAR_HOURS: SolarHours = {
	sunriseHour: SUNRISE_HOUR,
	solarNoonHour: SOLAR_NOON_HOUR,
	sunsetHour: SUNSET_HOUR,
};

export type SolarState = {
	/** 0–1 across 24h, wraps at midnight. */
	dayProgress: number;
	/** -1..1. Zero at sunrise/sunset, 1 at solar noon, -1 mid-night. */
	sunAltitude: number;
	/** Degrees. -70 at rise, 0 at solar noon, +70 at set. Repeats for the moon. */
	azimuth: number;
	isNight: boolean;
};

export function hoursFromDate(date: Date): number {
	return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

/** Quarter-sine ramp: 0 at t=0, 1 at t=1, flat-topped at the peak. */
const ramp = (t: number) => Math.sin((Math.PI / 2) * t);

export function solarStateAtHour(
	hour: number,
	hours: SolarHours = DEFAULT_SOLAR_HOURS,
): SolarState {
	const { sunriseHour, solarNoonHour, sunsetHour } = hours;
	const h = ((hour % 24) + 24) % 24;
	const dayProgress = h / 24;

	const isDay = h >= sunriseHour && h <= sunsetHour;

	let sunAltitude: number;
	let azimuth: number;

	if (isDay) {
		// Two half-arcs, each scaled by its OWN span, and each carrying its own
		// half of the azimuth sweep. Solar noon is not the midpoint of the day in
		// general, so a single symmetric sine would put peak light — and the
		// overhead point of the sweep — in the wrong place.
		if (h <= solarNoonHour) {
			const t = (h - sunriseHour) / (solarNoonHour - sunriseHour);
			sunAltitude = ramp(t);
			azimuth = -AZIMUTH_EXTENT + t * AZIMUTH_EXTENT;
		} else {
			const t = (h - solarNoonHour) / (sunsetHour - solarNoonHour);
			sunAltitude = ramp(1 - t);
			azimuth = t * AZIMUTH_EXTENT;
		}
	} else {
		// Night span wraps midnight: 20:00 -> 06:00 is 10h at these constants.
		// Without the wrap `since` goes negative after midnight and the whole
		// small-hours arc collapses.
		const nightSpan = 24 - sunsetHour + sunriseHour;
		const since = h > sunsetHour ? h - sunsetHour : h + (24 - sunsetHour);
		const mid = nightSpan / 2;
		// The moon's peak IS the midpoint of the night, so one symmetric arc is
		// correct here — there is no second constant for it to disagree with.
		sunAltitude = -(since <= mid
			? ramp(since / mid)
			: ramp((nightSpan - since) / mid));
		azimuth = -AZIMUTH_EXTENT + (since / nightSpan) * (AZIMUTH_EXTENT * 2);
	}

	return {
		dayProgress,
		sunAltitude,
		azimuth,
		isNight: sunAltitude < 0,
	};
}

export function getSolarState(date: Date): SolarState {
	return solarStateAtHour(hoursFromDate(date));
}
