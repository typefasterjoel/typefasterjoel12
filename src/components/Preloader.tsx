import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "#/lib/intro";
import { registerGsap } from "#/lib/motion";

/**
 * "First light" preloader. A wordmark breathes in, the gold horizon ray draws
 * across the screen, then the world opens beneath it — handing off to the hero
 * via `complete()`. The counter is gone: this is sunrise, not a system booting.
 */
export function Preloader() {
	const { skip, complete } = useIntro();
	const [visible, setVisible] = useState(true);
	const rootRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const dawnRef = useRef<HTMLDivElement>(null);
	const rayRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (skip) {
			setVisible(false);
			return;
		}
		registerGsap();

		const tl = gsap.timeline({
			onComplete: () => setVisible(false),
		});

		// wordmark breathes in quietly
		tl.fromTo(
			innerRef.current,
			{ opacity: 0, y: 8 },
			{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
		)
			// the horizon ray draws left to right — the sunrise
			.fromTo(
				rayRef.current,
				{ scaleX: 0, opacity: 0 },
				{ scaleX: 1, opacity: 1, duration: 0.9, ease: "power2.out" },
				"+=0.25",
			)
			// warm bloom swells beneath it
			.fromTo(
				dawnRef.current,
				{ opacity: 0, yPercent: 10 },
				{ opacity: 1, yPercent: 0, duration: 0.9, ease: "power2.out" },
				"<0.1",
			)
			// wordmark lifts and dissolves as the world opens
			.to(
				innerRef.current,
				{ y: -18, opacity: 0, duration: 0.55, ease: "power2.in" },
				"<0.2",
			)
			// ray blooms wide then softens
			.to(
				rayRef.current,
				{ scaleX: 1.12, opacity: 0, duration: 0.65, ease: "power2.inOut" },
				"-=0.15",
			)
			// cross-dissolve into the hero's golden hour
			.to(
				rootRef.current,
				{ opacity: 0, duration: 0.65, ease: "power2.inOut", onStart: complete },
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
				<span className="preloader-wordmark mono-label">typefasterjoel</span>
			</div>
		</div>
	);
}
