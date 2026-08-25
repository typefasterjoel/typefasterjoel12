import { Moon, Sun } from "lucide-react";
import { useSkyTime } from "#/lib/sky-time";
import { SOLAR_NOON_HOUR } from "#/lib/solar-clock";

/**
 * Interim control. Part 2 replaces this with the time scrubber, whose extremes
 * are these same two ends of the cycle.
 *
 * Vocabulary convention: user-facing copy says "daylight"/"night"; the state
 * underneath is an hour, not a theme name. Pressing this takes manual control
 * of the clock for the rest of the session.
 */
const DAYLIGHT_HOUR = SOLAR_NOON_HOUR;
const NIGHT_HOUR = 1;

export function ThemeToggle() {
	const { palette, setHour } = useSkyTime();
	const isNight = palette.isNight;
	const label = isNight ? "Switch to daylight" : "Switch to night";

	return (
		<button
			type="button"
			className="icon-btn"
			onClick={() => setHour(isNight ? DAYLIGHT_HOUR : NIGHT_HOUR)}
			aria-label={label}
			title={label}
		>
			{isNight ? (
				<Sun size={18} strokeWidth={1.75} aria-hidden="true" />
			) : (
				<Moon size={18} strokeWidth={1.75} aria-hidden="true" />
			)}
		</button>
	);
}
