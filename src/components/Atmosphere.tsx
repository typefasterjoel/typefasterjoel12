import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "#/lib/motion";

/**
 * The serene golden-hour field behind all content.
 *
 * Base layer (always): pure-CSS gradients + a breathing light bloom (see
 * `.atmosphere` in styles/app.css). This is also the static fallback for mobile
 * and reduced-motion.
 *
 * Phase 2 (capable desktops only): lazily mounts a Three.js field of drifting
 * gold motes into this element, layered over the CSS base. The heavy 3D code and
 * Three itself are loaded on demand, so visitors who can't see it never pay for
 * the download.
 */
function canRenderField(): boolean {
	if (typeof window === "undefined") return false;
	if (prefersReducedMotion()) return false;
	// desktop, precise pointer only — keeps it off phones/tablets
	if (!window.matchMedia("(pointer: fine)").matches) return false;
	if (!window.matchMedia("(min-width: 820px)").matches) return false;
	const cores = navigator.hardwareConcurrency;
	if (typeof cores === "number" && cores > 0 && cores <= 2) return false;
	return true;
}

export function Atmosphere() {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = ref.current;
		if (!container) return;

		let disposed = false;
		let cleanupField: (() => void) | null = null;

		const build = () => {
			if (cleanupField || !canRenderField()) return;
			import("#/lib/atmosphere-field")
				.then(({ createAtmosphereField }) => {
					if (disposed || cleanupField || !canRenderField()) return;
					cleanupField = createAtmosphereField(container);
				})
				.catch(() => {
					/* WebGL / chunk load failed — the CSS atmosphere remains */
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
	}, []);

	return <div className="atmosphere" aria-hidden="true" ref={ref} />;
}
