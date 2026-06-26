import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { IntroProvider } from "#/lib/intro";
import { initSmoothScroll, registerGsap } from "#/lib/motion";
import { ThemeProvider } from "#/lib/theme";
import { Atmosphere } from "./Atmosphere";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { Preloader } from "./Preloader";
import { RouteTransition } from "./RouteTransition";
import { SideRays } from "./SideRays";

/** Persistent app frame: providers, atmosphere, preloader, chrome + smooth scroll. */
export function AppShell({ children }: { children: React.ReactNode }) {
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

	return (
		<ThemeProvider>
			<IntroProvider>
				<Atmosphere />
				<SideRays />
				<Preloader />
				<RouteTransition />
				<div className="app-shell">
					<Nav />
					<main className="app-main">{children}</main>
					<Footer />
				</div>
			</IntroProvider>
		</ThemeProvider>
	);
}
