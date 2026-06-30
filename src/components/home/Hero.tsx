import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { Button } from "#/components/Button";
import { useIntro } from "#/lib/intro";
import {
	prefersReducedMotion,
	registerGsap,
	scrollToTarget,
} from "#/lib/motion";

/**
 * Arrival. The hero "crests the hill" — elements rise into view once the
 * preloader hands off, then the horizon rule draws in as the signature beat.
 *
 * Copy note: two headline options are commented below. Option A ("Design and
 * code, / undivided.") is the live choice — tighter and specific to Joel's
 * dual role. Swap to Option B to restore the original.
 */
export function Hero() {
	const { ready } = useIntro();
	const rootRef = useRef<HTMLElement>(null);
	const horizonRef = useRef<HTMLDivElement>(null);

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
		gsap.set(horizonRef.current, {
			scaleX: 0,
			opacity: 0,
			transformOrigin: "left center",
		});

		if (!ready) return;

		const tl = gsap.timeline();
		tl.to(targets, {
			y: 0,
			opacity: 1,
			duration: 1.1,
			ease: "power3.out",
			stagger: 0.1,
		}).to(
			horizonRef.current,
			{
				scaleX: 1,
				opacity: 1,
				duration: 1.0,
				ease: "power2.out",
			},
			"-=0.4",
		);

		return () => {
			tl.kill();
		};
	}, [ready]);

	return (
		<section className="hero container" ref={rootRef} id="top">
			{/* Option A (live): specific to Joel's dual role */}
			<h1 className="display hero-title" data-crest>
				Design and code,
				<br />
				<span className="accent">undivided.</span>
			</h1>

			{/* Option B: restore original copy in the new sparse layout
			<h1 className="display hero-title" data-crest>
				Interfaces that <span className="accent">mean</span> something.
			</h1> */}

			{/* The horizon — the signature beat. Draws in after elements crest. */}
			<div className="hero-horizon" ref={horizonRef} aria-hidden="true" />

			<p className="hero-byline" data-crest>
				Senior design engineer. 20+ years.
				<br />
				Currently at Buildout. Designing product and building Blueprint.
				<br />
				Building interfaces that move people and solve things that matter.
			</p>

			<div className="hero-cta" data-crest>
				<Button
					variant="ghost"
					arrow
					onClick={() => scrollToTarget("#work")}
				>
					See the work
				</Button>
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
