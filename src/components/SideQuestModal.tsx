import { gsap } from "gsap";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LinkChip } from "#/components/LinkChip";
import { Tag } from "#/components/Tag";
import type { SideQuest } from "#/data/side-quests";
import { computeFlipTransform } from "#/lib/flip";
import { prefersReducedMotion, registerGsap } from "#/lib/motion";

const FOCUSABLE =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

type Props = {
	quest: SideQuest;
	originRect: DOMRect;
	onClose: () => void;
};

export function SideQuestModal({ quest, originRect, onClose }: Props) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<Element | null>(null);
	const closingRef = useRef(false);
	const targetRectRef = useRef<DOMRect | null>(null);

	// Zoom in: measure the stage's natural (final) rect, then tween from a
	// translate/scale that makes it overlay the origin card down to identity.
	useLayoutEffect(() => {
		const stage = stageRef.current;
		if (!stage || prefersReducedMotion()) return;
		registerGsap();

		const target = stage.getBoundingClientRect();
		targetRectRef.current = target;
		const { x, y, scaleX, scaleY } = computeFlipTransform(originRect, target);

		gsap.fromTo(
			stage,
			{ x, y, scaleX, scaleY },
			{ x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.5, ease: "power3.out" },
		);
	}, [originRect]);

	const requestClose = () => {
		if (closingRef.current) return;
		closingRef.current = true;

		const stage = stageRef.current;
		const target = targetRectRef.current;
		if (!stage || !target || prefersReducedMotion()) {
			onClose();
			return;
		}

		const { x, y, scaleX, scaleY } = computeFlipTransform(originRect, target);
		gsap.to(stage, {
			x,
			y,
			scaleX,
			scaleY,
			duration: 0.4,
			ease: "power2.in",
			onComplete: onClose,
		});
	};

	// Body scroll lock, focus capture/restore, focus trap, and Escape-to-close
	// — same shape as ImageModal's dialog scaffolding.
	useEffect(() => {
		triggerRef.current = document.activeElement;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const dialog = dialogRef.current;
		const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
		focusables?.[0]?.focus();

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") requestClose();
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return createPortal(
		<div
			ref={dialogRef}
			className="side-quest-modal"
			role="dialog"
			aria-modal="true"
			aria-label={quest.title}
			onClick={requestClose}
		>
			<button
				type="button"
				className="icon-btn side-quest-modal-close"
				onClick={(e) => {
					e.stopPropagation();
					requestClose();
				}}
				aria-label="Close"
			>
				<X size={18} />
			</button>

			{/* biome-ignore lint/a11y/noStaticElementInteractions: click-catcher that only stops backdrop-close propagation, not a control itself */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: no keyboard-triggerable action of its own */}
			<div
				ref={stageRef}
				className="side-quest-modal-stage"
				style={{ transformOrigin: "center center" }}
				onClick={(e) => e.stopPropagation()}
			>
				<img
					src={quest.thumbnail.src}
					alt={quest.thumbnail.alt}
					width={quest.thumbnail.width}
					height={quest.thumbnail.height}
					decoding="async"
				/>
				<div className="side-quest-modal-body">
					<h3 className="h4">{quest.title}</h3>
					<p>{quest.blurb}</p>
					{quest.tags && quest.tags.length > 0 && (
						<div className="cluster" style={{ gap: "var(--s-2)" }}>
							{quest.tags.map((t) => (
								<Tag key={t}>{t}</Tag>
							))}
						</div>
					)}
					<div className="cluster" style={{ gap: "var(--s-2)" }}>
						{quest.links.map((l) => (
							<LinkChip key={l.label} link={l} />
						))}
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
