import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import type { ResumeRole } from "#/data/resume";
import { prefersReducedMotion, registerGsap } from "#/lib/motion";

type TimelineProps = {
	entries: ResumeRole[]
	condensed?: boolean
}

export function Timeline({ entries, condensed = false }: TimelineProps) {
	const railRef = useRef<HTMLDivElement>(null);
	const lineRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const rail = railRef.current;
		const line = lineRef.current;
		if (!rail || !line) return;
		if (prefersReducedMotion()) {
			gsap.set(line, { scaleY: 1 });
			return;
		}
		if (document.documentElement.dataset.motion !== "on") return;
		registerGsap();

		const ctx = gsap.context(() => {
			// Gold line draws in as the section scrolls through view
			gsap.fromTo(
				line,
				{ scaleY: 0 },
				{
					scaleY: 1,
					ease: "none",
					scrollTrigger: {
						trigger: rail,
						start: "top 80%",
						end: "bottom 60%",
						scrub: 1,
					},
				},
			);

			// Entries fade up once
			gsap.fromTo(
				".timeline-entry",
				{ y: 20, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					stagger: 0.1,
					duration: 0.75,
					ease: "power2.out",
					scrollTrigger: {
						trigger: rail,
						start: "top 80%",
						once: true,
					},
				},
			);
		}, rail);

		return () => ctx.revert();
	}, []);

	return (
		<div className="timeline">
			<div className="timeline-rail" ref={railRef}>
				<div className="timeline-line" ref={lineRef} />
				{entries.map((role) => (
					<div
						className="timeline-entry"
						key={`${role.company}-${role.start}`}
					>
						<div className="timeline-node" />
						<div className="timeline-content">
							<header className="timeline-header">
								<span className="timeline-company">
									{role.company}
									{role.suffix && <small>{role.suffix}</small>}
								</span>
								<span className="timeline-dates">
									{role.start} to {role.end}
								</span>
							</header>
							<span className="timeline-role">
								{role.title} · {role.location}
							</span>
							{!condensed && role.bullets.length > 0 && (
								<ul className="timeline-bullets">
									{role.bullets.map((bullet) => (
										<li key={bullet}>
											<span aria-hidden="true">·</span>
											{bullet}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
