import { gsap } from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "#/lib/motion";
import type { CaseFigure } from "#/data/projects";

interface Props {
	figures: CaseFigure[];
}

export function CaseGallery({ figures }: Props) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const currentRef = useRef(0);
	const [current, setCurrent] = useState(0);

	// Break out of the prose column to the full viewport width.
	// Measure the element's left offset from the viewport and negate it.
	const bleed = useCallback(() => {
		const el = wrapRef.current;
		if (!el) return;
		el.style.marginLeft = "0px";
		el.style.width = "";
		const left = el.getBoundingClientRect().left;
		el.style.marginLeft = `-${left}px`;
		el.style.width = "100vw";
	}, []);

	useEffect(() => {
		bleed();
		window.addEventListener("resize", bleed);
		return () => window.removeEventListener("resize", bleed);
	}, [bleed]);

	const goTo = useCallback(
		(idx: number) => {
			const track = trackRef.current;
			if (!track) return;
			const clamped = Math.max(0, Math.min(idx, figures.length - 1));
			currentRef.current = clamped;
			setCurrent(clamped);
			const target = clamped * -window.innerWidth;
			if (prefersReducedMotion()) {
				gsap.set(track, { x: target });
			} else {
				gsap.to(track, { x: target, duration: 0.8, ease: "power3.inOut" });
			}
		},
		[figures.length],
	);

	// Auto-advance
	useEffect(() => {
		if (figures.length <= 1) return;
		const id = setInterval(() => {
			const next = (currentRef.current + 1) % figures.length;
			goTo(next);
		}, 4500);
		return () => clearInterval(id);
	}, [figures.length, goTo]);

	// Keyboard navigation
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") goTo(currentRef.current - 1);
			if (e.key === "ArrowRight") goTo(currentRef.current + 1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [goTo]);

	if (figures.length === 0) return null;

	return (
		<div ref={wrapRef} className="case-gallery" aria-label="Project screenshots">
			<div ref={trackRef} className="case-gallery-track">
				{figures.map((f, i) => (
					<div
						key={f.src}
						className="case-gallery-slide"
						aria-hidden={i !== current}
					>
						<img
							src={f.src}
							alt={f.alt}
							loading={i === 0 ? "eager" : "lazy"}
							decoding="async"
						/>
						{f.caption && (
							<span className="case-gallery-caption mono-label">{f.caption}</span>
						)}
					</div>
				))}
			</div>

			{figures.length > 1 && (
				<div className="case-gallery-controls">
					<button
						className="case-gallery-arrow"
						onClick={() => goTo(currentRef.current - 1)}
						aria-label="Previous slide"
						disabled={current === 0}
					>
						<ArrowLeft size={16} />
					</button>
					<div className="case-gallery-dots" role="tablist">
						{figures.map((_, i) => (
							<button
								key={i}
								role="tab"
								className="case-gallery-dot"
								aria-selected={i === current}
								aria-label={`Slide ${i + 1}`}
								onClick={() => goTo(i)}
							/>
						))}
					</div>
					<button
						className="case-gallery-arrow"
						onClick={() => goTo(currentRef.current + 1)}
						aria-label="Next slide"
						disabled={current === figures.length - 1}
					>
						<ArrowRight size={16} />
					</button>
				</div>
			)}
		</div>
	);
}
