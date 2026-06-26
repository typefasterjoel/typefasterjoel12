import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let registered = false;

/** Register GSAP plugins exactly once (client-only). */
export function registerGsap() {
	if (registered || typeof window === "undefined") return;
	gsap.registerPlugin(ScrollTrigger);
	registered = true;
}

export function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let lenis: Lenis | null = null;
export function getLenis(): Lenis | null {
	return lenis;
}

/**
 * Initialise Lenis smooth scrolling and bind it to GSAP's ticker so
 * ScrollTrigger stays in sync. No-op (and native scrolling stays) under
 * reduced-motion. Returns a cleanup function.
 */
export function initSmoothScroll(): () => void {
	if (typeof window === "undefined" || prefersReducedMotion()) {
		return () => {};
	}
	registerGsap();

	lenis = new Lenis({
		duration: 1.1,
		easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
		smoothWheel: true,
	});

	lenis.on("scroll", ScrollTrigger.update);

	const onTick = (time: number) => {
		// GSAP ticker time is in seconds; Lenis expects milliseconds.
		lenis?.raf(time * 1000);
	};
	gsap.ticker.add(onTick);
	gsap.ticker.lagSmoothing(0);

	return () => {
		gsap.ticker.remove(onTick);
		lenis?.destroy();
		lenis = null;
	};
}

/** Smoothly scroll to a target (element or selector); falls back to native. */
export function scrollToTarget(
	target: string | HTMLElement,
	opts?: { offset?: number },
) {
	const offset = opts?.offset ?? -80;
	if (lenis) {
		lenis.scrollTo(target, { offset });
		return;
	}
	const el =
		typeof target === "string" ? document.querySelector(target) : target;
	if (el instanceof HTMLElement) {
		const top = el.getBoundingClientRect().top + window.scrollY + offset;
		window.scrollTo({ top, behavior: "smooth" });
	}
}
