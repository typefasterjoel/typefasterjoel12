import { useRouterState } from "@tanstack/react-router";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "#/lib/motion";

/**
 * Subtle content fade on route change.
 *
 * Fades `.hero` and `.ground-content` — never `.app-main` or `.ground`
 * themselves. `.app-main` persists across navigations (it is mounted once in
 * AppShell), and `.ground`'s opaque background lives on that same persistent
 * subtree, so animating opacity on either one makes the ground briefly
 * transparent and flashes the fixed sky behind it. Fading the content layer
 * one level in gets the same crossfade without ever touching what keeps the
 * ground opaque.
 */
export function RouteTransition() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const prev = useRef(pathname);
	const tlRef = useRef<gsap.core.Timeline | null>(null);

	useEffect(() => {
		if (pathname === prev.current) return;
		prev.current = pathname;
		if (prefersReducedMotion()) return;
		registerGsap();

		const targets = document.querySelectorAll(".hero, .ground-content");
		if (!targets.length) return;

		tlRef.current?.kill();
		const tl = gsap.timeline();
		tlRef.current = tl;

		tl.to(targets, { opacity: 0, duration: 0.15, ease: "power1.in" }).to(
			targets,
			{ opacity: 1, duration: 0.25, ease: "power1.out" },
		);

		return () => {
			tl.kill();
			gsap.set(targets, { opacity: 1 });
		};
	}, [pathname]);

	return null;
}
