import { type RefObject, useEffect, useRef } from "react";
import { prefersReducedMotion } from "#/lib/motion";

/**
 * Mounts the hero constellation on capable desktops only — same gate as the
 * atmosphere field. Everyone else (touch, small screens, reduced motion)
 * gets the CSS pulse on the "wander down" cue instead; the canvas and its
 * code never load for them.
 */
function canRenderField(): boolean {
	if (typeof window === "undefined") return false;
	if (prefersReducedMotion()) return false;
	if (!window.matchMedia("(pointer: fine)").matches) return false;
	if (!window.matchMedia("(min-width: 820px)").matches) return false;
	return true;
}

export function HeroConstellation({
	anchorRef,
}: {
	anchorRef: RefObject<HTMLElement | null>;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = ref.current;
		const anchor = anchorRef.current;
		if (!container || !anchor) return;

		let disposed = false;
		let cleanupField: (() => void) | null = null;

		const build = () => {
			if (cleanupField || !canRenderField()) return;
			import("#/lib/hero-constellation")
				.then(({ createHeroConstellation }) => {
					if (disposed || cleanupField || !canRenderField()) return;
					cleanupField = createHeroConstellation(container, anchor);
				})
				.catch(() => {
					/* chunk load failed — the cue pulse still guides the eye */
				});
		};

		const teardown = () => {
			cleanupField?.();
			cleanupField = null;
		};

		const evaluate = () => {
			if (canRenderField()) build();
			else teardown();
		};

		build();

		const queries = [
			window.matchMedia("(min-width: 820px)"),
			window.matchMedia("(pointer: fine)"),
			window.matchMedia("(prefers-reduced-motion: reduce)"),
		];
		for (const q of queries) q.addEventListener("change", evaluate);

		return () => {
			disposed = true;
			for (const q of queries) q.removeEventListener("change", evaluate);
			teardown();
		};
	}, [anchorRef]);

	return <div className="hero-constellation" aria-hidden="true" ref={ref} />;
}
