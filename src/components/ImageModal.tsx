import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { CaseFigure } from "#/data/projects";
import { prefersReducedMotion, registerGsap } from "#/lib/motion";

const FOCUSABLE =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Props {
	figures: CaseFigure[];
	index: number;
	onIndexChange: (index: number) => void;
	onClose: () => void;
}

export function ImageModal({ figures, index, onIndexChange, onClose }: Props) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<Element | null>(null);
	const closingRef = useRef(false);

	const canPrev = index > 0;
	const canNext = index < figures.length - 1;

	// Zoom/fade pop on mount — same easing/duration family as SideQuestModal's
	// stage animation, scoped to mount only (deps: []) so prev/next navigation
	// swapping `index` doesn't re-trigger it. Cleanup kills the tween and
	// clears the transform so a dev-mode double-invoke re-measures cleanly
	// instead of compounding on an already-animated state.
	useLayoutEffect(() => {
		const stage = stageRef.current;
		if (!stage || prefersReducedMotion()) return;
		registerGsap();
		const tween = gsap.fromTo(
			stage,
			{ scale: 0.92, opacity: 0 },
			{ scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" },
		);
		return () => {
			tween.kill();
			gsap.set(stage, { clearProps: "transform,opacity" });
		};
	}, []);

	const requestClose = () => {
		if (closingRef.current) return;
		closingRef.current = true;
		const stage = stageRef.current;
		if (!stage || prefersReducedMotion()) {
			onClose();
			return;
		}
		gsap.to(stage, {
			scale: 0.92,
			opacity: 0,
			duration: 0.3,
			ease: "power2.in",
			onComplete: onClose,
		});
	};

	// Body scroll lock, focus capture/restore, and the focus trap itself.
	useEffect(() => {
		triggerRef.current = document.activeElement;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const dialog = dialogRef.current;
		const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
		focusables?.[0]?.focus();

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Tab" && dialog) {
				const items = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
				if (items.length === 0) return;
				const first = items[0];
				const last = items[items.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", onKeyDown);
			if (triggerRef.current instanceof HTMLElement) {
				triggerRef.current.focus();
			}
		};
	}, []);

	const goPrev = () => canPrev && onIndexChange(index - 1);
	const goNext = () => canNext && onIndexChange(index + 1);

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape") requestClose();
		if (e.key === "ArrowLeft") goPrev();
		if (e.key === "ArrowRight") goNext();
	};

	const figure = figures[index];

	return createPortal(
		<div
			ref={dialogRef}
			className="image-modal"
			role="dialog"
			aria-modal="true"
			aria-label="Image viewer"
			onClick={requestClose}
			onKeyDown={onKeyDown}
		>
			<button
				type="button"
				className="icon-btn image-modal-close"
				onClick={requestClose}
				aria-label="Close"
			>
				<X size={18} />
			</button>

			{canPrev && (
				<button
					type="button"
					className="icon-btn image-modal-arrow image-modal-arrow--prev"
					onClick={(e) => {
						e.stopPropagation();
						goPrev();
					}}
					aria-label="Previous image"
				>
					<ArrowLeft size={18} />
				</button>
			)}

			{/* biome-ignore lint/a11y/noStaticElementInteractions: click-catcher that only stops backdrop-close propagation, not a control itself */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: no keyboard-triggerable action of its own */}
			<div
				ref={stageRef}
				className="image-modal-stage"
				onClick={(e) => e.stopPropagation()}
			>
				<img
					src={figure.src}
					alt={figure.alt}
					width={figure.width}
					height={figure.height}
					decoding="async"
				/>
				<div className="image-modal-meta">
					<span className="mono-label image-modal-counter">
						{index + 1} / {figures.length}
					</span>
					{figure.caption && (
						<span className="mono-label image-modal-caption">
							{figure.caption}
						</span>
					)}
				</div>
			</div>

			{canNext && (
				<button
					type="button"
					className="icon-btn image-modal-arrow image-modal-arrow--next"
					onClick={(e) => {
						e.stopPropagation();
						goNext();
					}}
					aria-label="Next image"
				>
					<ArrowRight size={18} />
				</button>
			)}
		</div>,
		document.body,
	);
}
