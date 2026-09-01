import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { Button } from "#/components/Button";
import { FeaturedProject } from "#/components/home/FeaturedProject";
import { EXPERIENCE_LABEL } from "#/data/resume";
import { useIntro } from "#/lib/intro";
import {
	prefersReducedMotion,
	registerGsap,
	scrollToTarget,
} from "#/lib/motion";

/**
 * Arrival. The hero "crests the hill" — the sky copy rises into view once the
 * preloader hands off, the horizon draws in, and the first destination on the
 * ground arrives beneath it.
 *
 * The hero's horizon is a REAL EDGE here, not a drawn line: the ground plane
 * starts inside the hero and runs past the fold into `.ground` proper, which
 * is why `.ground`'s own seam hairline is suppressed when it follows a hero
 * (see `.hero + .ground::before` in app.css).
 *
 * That is not decoration, it is legibility. `inkForSky` derives ink from the
 * ZENITH's brightness, but the bottom of the hero is horizon sky — at dusk
 * the zenith goes dark purple (so ink resolves light) while the horizon
 * floods bright amber, and light ink on bright amber measured 1.06:1. Ink on
 * `--ground` is contrast-tested across all 1,440 minutes; ink on horizon sky
 * is not. So the band sits on the ground, and reads at every hour.
 *
 * Copy note: the headline is deliberately the compressed form of the idea the
 * `Path` section opens with. If one of the two ever changes, change Path — the
 * hero is what gets read first.
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
		const band = root.querySelector<HTMLElement>("[data-band]");
		gsap.set(targets, { y: 42, opacity: 0 });
		gsap.set(horizonRef.current, {
			scaleX: 0,
			opacity: 0,
			transformOrigin: "left center",
		});
		// `--featured-reveal` drives the aperture's scrim in CSS, so the image
		// resolves to full colour as the band lands rather than animating a
		// filter from JS. It inherits, so setting it here reaches the aperture.
		if (band) {
			gsap.set(band, { y: 24, opacity: 0, "--featured-reveal": 0 });
		}

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

		// The horizon draws, then what lies beyond it arrives. One beat,
		// motivated: the hand-off from "you have arrived" to "here is why to
		// stay". Nothing else on the page animates on load.
		if (band) {
			tl.to(
				band,
				{
					y: 0,
					opacity: 1,
					"--featured-reveal": 1,
					duration: 0.9,
					ease: "power3.out",
				},
				"-=0.55",
			);
		}

		return () => {
			tl.kill();
		};
	}, [ready]);

	return (
		<section className="hero" ref={rootRef} id="top">
			<div className="hero-sky">
				<div className="container">
					<h1 className="display hero-title" data-crest>
						Design and code,
						<br />
						<span className="accent">undivided.</span>
					</h1>

					<p className="hero-byline" data-crest>
						Senior design engineer, {EXPERIENCE_LABEL} years. Currently at
						Buildout, where I build Blueprint.
					</p>

					<div className="hero-cta" data-crest>
						<Button
							variant="ghost"
							arrow
							onClick={() => scrollToTarget("#about")}
						>
							Who I am
						</Button>
					</div>
				</div>
			</div>

			{/* Below the horizon. The rule is the lit seam along the ground's
			    top edge, and it keeps its draw-in — the signature arrival beat. */}
			<div className="hero-ground">
				<div className="hero-horizon" ref={horizonRef} aria-hidden="true" />
				{/* No section marker here. The byline above already says he builds
				    Blueprint, and "Blueprint · 2025 – present" says it is current,
				    so a "what I'm building" eyebrow only repeated them — while
				    costing ~60px of the tightest vertical budget on the page,
				    which is what pushed the horizon up over the sun. */}
				<div className="container" data-band>
					<FeaturedProject slug="blueprint" />
				</div>
			</div>
		</section>
	);
}
