import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { btnClass } from "#/components/Button";
import { Status } from "#/components/Tag";
import { useIntro } from "#/lib/intro";
import {
	prefersReducedMotion,
	registerGsap,
	scrollToTarget,
} from "#/lib/motion";

/**
 * Arrival. The hero "crests the hill" — its elements rise into view once the
 * preloader hands off (`ready`). Under reduced-motion / no-JS it's just visible.
 */
export function Hero() {
	const { ready } = useIntro();
	const rootRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const armed =
			document.documentElement.dataset.motion === "on" &&
			!prefersReducedMotion();
		if (!armed) return;
		registerGsap();

		const targets = root.querySelectorAll<HTMLElement>("[data-crest]");
		gsap.set(targets, { y: 42, opacity: 0 });
		if (!ready) return; // wait for the preloader to clear

		const tl = gsap.timeline();
		tl.to(targets, {
			y: 0,
			opacity: 1,
			duration: 1.1,
			ease: "power3.out",
			stagger: 0.1,
		});
		return () => {
			tl.kill();
		};
	}, [ready]);

	return (
		<section className="hero container" ref={rootRef} id="top">
			<h1 className="display hero-title" data-crest>
				Interfaces that <span className="accent">mean</span> something.
			</h1>

			<p className="body-lg hero-sub" data-crest>
				I'm Joel, a UX/UI designer and senior design engineer. This is a short walk
				through the things I've made and the way I think.
			</p>

			<div className="cluster hero-actions" data-crest>
				<button
					type="button"
					className={btnClass({ variant: "primary" })}
					onClick={() => scrollToTarget("#work")}
				>
					Wander the work
					<span className="arrow" aria-hidden="true">
						<ArrowRight size={16} />
					</span>
				</button>
				<button
					type="button"
					className={btnClass({ variant: "outline" })}
					onClick={() => scrollToTarget("#contact")}
				>
					Say hi
				</button>
				<Status>available for work</Status>
			</div>

			<button
				type="button"
				className="scroll-cue"
				data-crest
				onClick={() => scrollToTarget("#path")}
				aria-label="Scroll down"
			>
				<span className="line" aria-hidden="true" />
				<span className="mono-label">wander down</span>
			</button>
		</section>
	);
}
