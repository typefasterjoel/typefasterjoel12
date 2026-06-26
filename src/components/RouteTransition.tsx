import { useRouterState } from "@tanstack/react-router";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "#/lib/motion";

/** Subtle content fade on route change. */
export function RouteTransition() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const prev = useRef(pathname);
	const tlRef = useRef<gsap.core.Timeline | null>(null);

	useEffect(() => {
		if (pathname === prev.current) return;
		prev.current = pathname;
		if (prefersReducedMotion()) return;
		registerGsap();

		const main = document.querySelector(".app-main");
		if (!main) return;

		tlRef.current?.kill();
		const tl = gsap.timeline();
		tlRef.current = tl;

		tl.to(main, { opacity: 0, duration: 0.15, ease: "power1.in" })
			.to(main, { opacity: 1, duration: 0.25, ease: "power1.out" });

		return () => {
			tl.kill();
			gsap.set(main, { opacity: 1 });
		};
	}, [pathname]);

	return null;
}
