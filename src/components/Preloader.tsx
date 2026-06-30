import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "#/lib/intro";
import { registerGsap } from "#/lib/motion";
import { Logo } from "./Logo";

/**
 * "First light" preloader. The crest breathes in alongside a warm bloom that
 * swells from below, then the world opens — handing off to the hero via
 * `complete()`. No ray: light, not a loading bar.
 */
export function Preloader() {
	const { skip, complete } = useIntro();
	const [visible, setVisible] = useState(true);
	const rootRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const dawnRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (skip) {
			setVisible(false);
			return;
		}
		registerGsap();

		const tl = gsap.timeline({
			onComplete: () => setVisible(false),
		});

		// crest breathes in, bloom swells softly beneath it
		tl.fromTo(
			innerRef.current,
			{ opacity: 0, y: 8 },
			{ opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
		)
			.fromTo(
				dawnRef.current,
				{ opacity: 0, yPercent: 10 },
				{ opacity: 1, yPercent: 0, duration: 1.0, ease: "power2.out" },
				"-=0.3",
			)
			// crest lifts and dissolves as the world opens
			.to(
				innerRef.current,
				{ y: -18, opacity: 0, duration: 0.55, ease: "power2.in" },
				"+=0.3",
			)
			// bloom softens
			.to(
				dawnRef.current,
				{ opacity: 0, duration: 0.65, ease: "power2.inOut" },
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
			<div className="preloader-inner" ref={innerRef}>
				<Logo className="preloader-logo" title="typefasterjoel" />
				<span className="preloader-wordmark mono-label">typefasterjoel</span>
			</div>
		</div>
	);
}
