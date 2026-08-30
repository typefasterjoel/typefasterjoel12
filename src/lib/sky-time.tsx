/**
 * The clock that drives every colour on the site.
 *
 * There is no default theme here, because there is no default to get wrong: a
 * visitor at 2pm gets afternoon, a visitor at 11pm gets night, and both are
 * correct. The server has no access to the visitor's timezone, so SSR emits
 * the noon fallback that lives in `tokens.css`, a pre-hydration script paints
 * the two properties that would be most jarring to see wrong, and hydration
 * fills in the full palette.
 */
import { ScriptOnce } from "@tanstack/react-router";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	GROUND_DAY,
	GROUND_NIGHT,
	getPaletteAtHour,
	INK_DAY,
	INK_NIGHT,
	type SkyPalette,
} from "#/lib/sky-palette";
import {
	hoursFromDate,
	SOLAR_NOON_HOUR,
	SUNRISE_HOUR,
	SUNSET_HOUR,
} from "#/lib/solar-clock";

const STORAGE_KEY = "tfj-hour";

/** Sampled once a minute. Real time moves far too slowly to spend a frame on. */
const TICK_MS = 60_000;

/**
 * What SSR renders. Matches the noon fallback in `tokens.css` so the markup the
 * server sends and the markup the client hydrates agree exactly; the real hour
 * only ever arrives in an effect, never in a `useState` initialiser.
 */
const SSR_FALLBACK_HOUR = SOLAR_NOON_HOUR;

/**
 * Paints the palette before React hydrates, so first paint is already the
 * right hour rather than a flash of the noon fallback.
 *
 * This is a deliberately minimal duplicate of the palette maths: inlining the
 * full OKLab chain into a blocking script would cost more than it saves, so
 * the script sets only the properties that would be most jarring to see
 * wrong (ground, ink, and the sky-relative ink the hero and nav use), and
 * hydration fills in the rest a moment later. `--ink-on-sky` gets the same
 * binary day/night placeholder as `--ink` here — it is only ever a flash
 * guard; the real continuous solve arrives with the first palette. The
 * constants are interpolated from the palette module so none of them can
 * drift apart.
 */
const SKY_INIT_SCRIPT = `(function(){try{
  var d=document.documentElement;
  var stored=localStorage.getItem('${STORAGE_KEY}');
  var h=stored!==null?parseFloat(stored):NaN;
  if(isNaN(h)){var n=new Date();h=n.getHours()+n.getMinutes()/60;}
  h=((h%24)+24)%24;
  // Strict at sunset, inclusive at sunrise: that is exactly where
  // sky-palette's own isNight flips, so the two never disagree by a frame.
  var night=(h>${SUNSET_HOUR}||h<${SUNRISE_HOUR});
  d.style.setProperty('--ground',night?'${GROUND_NIGHT}':'${GROUND_DAY}');
  d.style.setProperty('--ink',night?'${INK_NIGHT}':'${INK_DAY}');
  d.style.setProperty('--ink-on-sky',night?'${INK_NIGHT}':'${INK_DAY}');
  d.dataset.skyState=night?'night':'day';
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    d.dataset.motion='on';
  }
}catch(e){}})();`;

type SkyTimeValue = {
	/** The hour currently being displayed. */
	hour: number;
	palette: SkyPalette;
	/** True once the visitor has taken manual control. */
	isOverridden: boolean;
	/** Manual override; persists for the session. */
	setHour: (hour: number) => void;
	/** Hand authority back to the clock. */
	clearOverride: () => void;
};

const SkyTimeContext = createContext<SkyTimeValue | null>(null);

/** Writes the palette onto :root. Every colour in the site flows from here. */
function applyPalette(p: SkyPalette): void {
	const s = document.documentElement.style;
	s.setProperty("--sky-high", p.skyHigh);
	s.setProperty("--sky-low", p.skyLow);
	s.setProperty("--light", p.light);
	s.setProperty("--ground", p.ground);
	s.setProperty("--surface", p.surface);
	s.setProperty("--surface-2", p.surface2);
	s.setProperty("--border", p.border);
	s.setProperty("--border-strong", p.borderStrong);
	s.setProperty("--ink", p.ink);
	s.setProperty("--ink-1", p.ink1);
	s.setProperty("--ink-2", p.ink2);
	s.setProperty("--ink-on-sky", p.inkOnSky);
	s.setProperty("--ink-on-sky-1", p.inkOnSky1);
	s.setProperty("--ink-on-sky-2", p.inkOnSky2);
	s.setProperty("--accent", p.accent);
	s.setProperty("--accent-strong", p.accentStrong);
	s.setProperty("--on-accent", p.onAccent);
	s.setProperty("--light-angle", `${p.lightAngle}deg`);
	s.setProperty("--shadow-dist", `${p.shadowDist}px`);
	s.setProperty("--display-opsz", String(p.displayOpsz));
	s.setProperty("--display-wght", String(p.displayWght));
	s.setProperty("--body-wght", String(p.bodyWght));
	document.documentElement.dataset.skyState = p.isNight ? "night" : "day";
}

function readStoredHour(): number | null {
	let stored: string | null = null;
	try {
		stored = localStorage.getItem(STORAGE_KEY);
	} catch {
		/* storage unavailable; the clock still works for this session */
	}
	if (stored === null) return null;
	const parsed = Number.parseFloat(stored);
	return Number.isNaN(parsed) ? null : parsed;
}

export function SkyTimeProvider({ children }: { children: React.ReactNode }) {
	// `null` means "not resolved yet" — the state SSR renders in, and the state
	// the client hydrates in. Keeping the placeholder distinguishable is what
	// stops the noon palette being written over the init script's correct
	// ground on the first passive-effect flush.
	const [hour, setHourState] = useState<number | null>(null);
	const [isOverridden, setOverridden] = useState(false);

	// Adopt the real local hour (or a stored override) once mounted.
	useEffect(() => {
		const stored = readStoredHour();
		if (stored !== null) {
			setOverridden(true);
			setHourState(stored);
			return;
		}
		setHourState(hoursFromDate(new Date()));
	}, []);

	// The clock. Stops mattering once the visitor takes manual control.
	useEffect(() => {
		if (isOverridden) return;
		const id = setInterval(() => {
			setHourState(hoursFromDate(new Date()));
		}, TICK_MS);
		return () => clearInterval(id);
	}, [isOverridden]);

	const displayHour = hour ?? SSR_FALLBACK_HOUR;
	const palette = useMemo(() => getPaletteAtHour(displayHour), [displayHour]);

	useEffect(() => {
		// Before the hour resolves the init script owns :root. Writing the noon
		// fallback here would start a --dur-sky crossfade to the wrong palette.
		if (hour === null) return;
		applyPalette(palette);
	}, [hour, palette]);

	const setHour = useCallback((next: number) => {
		setOverridden(true);
		setHourState(next);
		try {
			localStorage.setItem(STORAGE_KEY, String(next));
		} catch {
			/* override still applies for this session */
		}
	}, []);

	const clearOverride = useCallback(() => {
		setOverridden(false);
		setHourState(hoursFromDate(new Date()));
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* nothing to clear */
		}
	}, []);

	const value = useMemo(
		() => ({
			hour: displayHour,
			palette,
			isOverridden,
			setHour,
			clearOverride,
		}),
		[displayHour, palette, isOverridden, setHour, clearOverride],
	);

	return (
		<SkyTimeContext.Provider value={value}>
			<ScriptOnce>{SKY_INIT_SCRIPT}</ScriptOnce>
			{children}
		</SkyTimeContext.Provider>
	);
}

export function useSkyTime(): SkyTimeValue {
	const ctx = useContext(SkyTimeContext);
	if (!ctx) throw new Error("useSkyTime must be used within SkyTimeProvider");
	return ctx;
}
