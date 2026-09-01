import { useRouterState } from "@tanstack/react-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { IntroProvider } from "#/lib/intro";
import { getLenis, initSmoothScroll, registerGsap } from "#/lib/motion";
import { SkyTimeProvider } from "#/lib/sky-time";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { Preloader } from "./Preloader";
import { RouteTransition } from "./RouteTransition";
import { Sky } from "./Sky";

/** Persistent app frame: providers, atmosphere, preloader, chrome + smooth scroll. */
export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	useEffect(() => {
		registerGsap();
		const cleanup = initSmoothScroll();
		// Reveal triggers are created in child effects; recalc once mounted.
		const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
		return () => {
			cancelAnimationFrame(raf);
			cleanup();
		};
	}, []);

	// Lenis tracks scroll independently of the DOM: a section link (e.g. Nav's
	// "Contact") starts a *programmatic* Lenis animation toward a target Y that
	// belongs to the page being left. The router's scroll restoration then
	// resets native scroll on the new route (`onRendered`, a layout effect —
	// runs before this), but Lenis never hears about it while that animation
	// is still in flight (`onNativeScroll` only syncs when idle or user-driven),
	// so it keeps dragging the page back toward the stale target and the
	// route can land scrolled instead of at the top. Re-sync Lenis to wherever
	// the router just put the scrollbar and cancel any leftover animation.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is a trigger only, not read in the body
	useEffect(() => {
		getLenis()?.scrollTo(window.scrollY, { immediate: true });
	}, [pathname]);

	return (
		<SkyTimeProvider>
			<IntroProvider>
				<Sky />
				<Preloader />
				<RouteTransition />
				<div className="app-shell">
					<Nav />
					<main className="app-main">{children}</main>
					<Footer />
				</div>
			</IntroProvider>
		</SkyTimeProvider>
	);
}
