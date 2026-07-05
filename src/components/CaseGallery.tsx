import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CaseFigure } from "#/data/projects";
import { prefersReducedMotion } from "#/lib/motion";

const AUTO_ADVANCE_MS = 4500;

interface Props {
	figures: CaseFigure[];
	onSlideClick?: (index: number) => void;
}

export function CaseGallery({ figures, onSlideClick }: Props) {
	const wrapRef = useRef<HTMLElement>(null);
	const pausedRef = useRef(false);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		slidesToScroll: "auto",
		loop: true,
		watchDrag: true,
	});
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
	const [selected, setSelected] = useState(0);
	const [canPrev, setCanPrev] = useState(false);
	const [canNext, setCanNext] = useState(false);

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

	// Sync React state from Embla's own state.
	useEffect(() => {
		if (!emblaApi) return;
		const sync = () => {
			setScrollSnaps(emblaApi.scrollSnapList());
			setSelected(emblaApi.selectedScrollSnap());
			setCanPrev(emblaApi.canScrollPrev());
			setCanNext(emblaApi.canScrollNext());
		};
		sync();
		emblaApi.on("select", sync);
		emblaApi.on("reInit", sync);
		return () => {
			emblaApi.off("select", sync);
			emblaApi.off("reInit", sync);
		};
	}, [emblaApi]);

	const scrollPrev = useCallback(() => {
		emblaApi?.scrollPrev(prefersReducedMotion());
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext(prefersReducedMotion());
	}, [emblaApi]);

	const scrollTo = useCallback(
		(idx: number) => {
			emblaApi?.scrollTo(idx, prefersReducedMotion());
		},
		[emblaApi],
	);

	// Auto-advance, paused on hover/focus, skipped under reduced motion.
	useEffect(() => {
		if (!emblaApi || figures.length <= 1 || prefersReducedMotion()) return;
		const id = setInterval(() => {
			if (pausedRef.current) return;
			if (emblaApi.canScrollNext()) emblaApi.scrollNext();
			else emblaApi.scrollTo(0);
		}, AUTO_ADVANCE_MS);
		return () => clearInterval(id);
	}, [emblaApi, figures.length]);

	// Keyboard navigation, scoped to the gallery (not global).
	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLElement>) => {
			if (e.key === "ArrowLeft") scrollPrev();
			if (e.key === "ArrowRight") scrollNext();
		},
		[scrollPrev, scrollNext],
	);

	if (figures.length === 0) return null;

	return (
		<section
			ref={wrapRef}
			className="case-gallery"
			aria-roledescription="carousel"
			aria-label="Project screenshots"
			onKeyDown={onKeyDown}
			onMouseEnter={() => {
				pausedRef.current = true;
			}}
			onMouseLeave={() => {
				pausedRef.current = false;
			}}
			onFocus={() => {
				pausedRef.current = true;
			}}
			onBlur={() => {
				pausedRef.current = false;
			}}
		>
			<div ref={emblaRef} className="case-gallery-viewport">
				<div className="case-gallery-container">
					{figures.map((f, i) => (
						<div key={f.src} className="case-gallery-slide">
							<button
								type="button"
								className="case-gallery-slide-trigger"
								onClick={() => onSlideClick?.(i)}
								aria-label={`Open ${f.alt} full-screen`}
							>
								<img
									src={f.src}
									alt={f.alt}
									loading={i === 0 ? "eager" : "lazy"}
									decoding="async"
								/>
							</button>
							{f.caption && (
								<span className="case-gallery-caption mono-label">
									{f.caption}
								</span>
							)}
						</div>
					))}
				</div>
			</div>

			{scrollSnaps.length > 1 && (
				<div className="case-gallery-controls">
					<button
						type="button"
						className="case-gallery-arrow"
						onClick={scrollPrev}
						aria-label="Previous slide"
						disabled={!canPrev}
					>
						<ArrowLeft size={16} />
					</button>
					<div className="case-gallery-dots" role="tablist">
						{scrollSnaps.map((snap, i) => (
							<button
								key={snap}
								type="button"
								role="tab"
								className="case-gallery-dot"
								aria-selected={i === selected}
								aria-label={`Slide ${i + 1}`}
								onClick={() => scrollTo(i)}
							/>
						))}
					</div>
					<button
						type="button"
						className="case-gallery-arrow"
						onClick={scrollNext}
						aria-label="Next slide"
						disabled={!canNext}
					>
						<ArrowRight size={16} />
					</button>
				</div>
			)}
		</section>
	);
}
