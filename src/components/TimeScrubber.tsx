import { useCallback, useRef } from "react";
import { useSkyTime } from "#/lib/sky-time";

/** Arrow keys move half an hour at a time. */
const STEP_HOURS = 0.5;

/**
 * Travel through the day.
 *
 * Replaces the old light/dark toggle, which cannot express this system. Its
 * two ends double as a day/night override, which is also the accessibility
 * escape hatch: someone who needs a light page at 3am can have one.
 *
 * Deliberately carries no clock readout. The affordance is the light changing.
 */
export function TimeScrubber() {
	const { hour, setHour, clearOverride, isOverridden } = useSkyTime();
	const trackRef = useRef<HTMLDivElement>(null);
	const dragging = useRef(false);

	const hourFromClientX = useCallback((clientX: number) => {
		const track = trackRef.current;
		if (!track) return null;
		const rect = track.getBoundingClientRect();
		const t = (clientX - rect.left) / rect.width;
		return Math.min(24, Math.max(0, t * 24));
	}, []);

	const onPointerDown = (e: React.PointerEvent) => {
		dragging.current = true;
		e.currentTarget.setPointerCapture(e.pointerId);
		const h = hourFromClientX(e.clientX);
		if (h !== null) setHour(h);
	};

	const onPointerMove = (e: React.PointerEvent) => {
		if (!dragging.current) return;
		const h = hourFromClientX(e.clientX);
		if (h !== null) setHour(h);
	};

	const onPointerUp = (e: React.PointerEvent) => {
		dragging.current = false;
		e.currentTarget.releasePointerCapture(e.pointerId);
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		switch (e.key) {
			case "ArrowLeft":
			case "ArrowDown":
				e.preventDefault();
				setHour(Math.max(0, hour - STEP_HOURS));
				break;
			case "ArrowRight":
			case "ArrowUp":
				e.preventDefault();
				setHour(Math.min(24, hour + STEP_HOURS));
				break;
			case "Home":
				e.preventDefault();
				setHour(13); // full day
				break;
			case "End":
				e.preventDefault();
				setHour(1); // full night
				break;
			case "Escape":
				e.preventDefault();
				clearOverride(); // hand authority back to the clock
				break;
		}
	};

	const pct = (hour / 24) * 100;

	return (
		<div className="time-scrubber">
			<div
				ref={trackRef}
				className="time-scrubber-track"
				role="slider"
				tabIndex={0}
				aria-label="Time of day"
				aria-valuemin={0}
				aria-valuemax={24}
				aria-valuenow={Math.round(hour * 10) / 10}
				aria-valuetext={describeHour(hour)}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onKeyDown={onKeyDown}
			>
				<span
					className="time-scrubber-thumb"
					style={{ left: `${pct}%` }}
					aria-hidden="true"
				/>
			</div>
			{isOverridden ? (
				<button
					type="button"
					className="time-scrubber-reset"
					onClick={clearOverride}
				>
					now
				</button>
			) : null}
		</div>
	);
}

/**
 * Spoken label for screen readers. Words, not numerals — a reader should hear
 * what the light is doing, which is the same thing a sighted visitor sees.
 */
function describeHour(hour: number): string {
	if (hour < 5) return "deep night";
	if (hour < 6.5) return "before dawn";
	if (hour < 9) return "sunrise";
	if (hour < 11) return "morning";
	if (hour < 15) return "midday";
	if (hour < 18) return "afternoon";
	if (hour < 20.5) return "sunset";
	if (hour < 22) return "dusk";
	return "night";
}
