import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "#/lib/intro";
import { registerGsap } from "#/lib/motion";
import { Logo } from "./Logo";

/**
 * "First light" preloader. Opens dark and quiet, ticks a Space Mono counter,
 * then breaks into dawn and clears — handing off to the hero's crest via
 * `complete()`. Rendered identically on server + first client paint to avoid
 * hydration mismatch; skipped (instantly hidden) for returning visitors and
 * under reduced motion.
 */
export function Preloader() {
	const { skip, complete } = useIntro();
	const [visible, setVisible] = useState(true);
	const rootRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const dawnRef = useRef<HTMLDivElement>(null);
	const rayRef = useRef<HTMLDivElement>(null);
	const countRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (skip) {
			setVisible(false);
			return;
		}
		registerGsap();
		const counter = { v: 0 };
		const tl = gsap.timeline({
			onComplete: () => setVisible(false),
		});

		tl.to(counter, {
			v: 100,
			duration: 1.7,
			ease: "power1.inOut",
			onUpdate: () => {
				if (countRef.current) {
					countRef.current.textContent = String(Math.round(counter.v)).padStart(
						3,
						"0",
					);
				}
			},
		})
			// draw the fine first-light ray across the horizon
			.fromTo(
				rayRef.current,
				{ scaleX: 0, opacity: 0 },
				{ scaleX: 1, opacity: 1, duration: 0.9, ease: "power2.out" },
				"+=0.15",
			)
			// warm bloom swells beneath it, matching the page's atmosphere
			.fromTo(
				dawnRef.current,
				{ opacity: 0, yPercent: 12 },
				{ opacity: 1, yPercent: 0, duration: 1.1, ease: "power2.out" },
				"<0.1",
			)
			// content lifts away
			.to(
				innerRef.current,
				{ y: -14, opacity: 0, duration: 0.6, ease: "power2.in" },
				"<",
			)
			// the ray blooms wide + softens just before the dissolve
			.to(
				rayRef.current,
				{ scaleX: 1.15, opacity: 0, duration: 0.7, ease: "power2.inOut" },
				"-=0.2",
			)
			// cross-dissolve into the hero's golden hour
			.to(
				rootRef.current,
				{ opacity: 0, duration: 0.7, ease: "power2.inOut", onStart: complete },
				"<0.1",
			);

		return () => {
			tl.kill();
		};
	}, [skip, complete]);

	if (!visible) return null;

	return (
		<div className="preloader" ref={rootRef} aria-hidden="true">
			<div className="preloader-dawn" ref={dawnRef} />
			<div className="preloader-ray" ref={rayRef} />
			<div className="preloader-inner" ref={innerRef}>
				<Logo className="logo" />
				<span className="preloader-coord">first light</span>
				<span className="preloader-count" ref={countRef}>
					000
				</span>
			</div>
		</div>
	);
}
