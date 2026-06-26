import { gsap } from "gsap";
import { type ElementType, useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "#/lib/motion";

type RevealProps = {
	as?: ElementType;
	children: React.ReactNode;
	className?: string;
	/** seconds to delay the reveal (used to stagger siblings) */
	delay?: number;
	/** starting vertical offset in px */
	y?: number;
};

/**
 * Gentle fade-up that fires as the element scrolls into view. Armed only when
 * motion is enabled (the head script sets [data-motion="on"]); under
 * reduced-motion / no-JS the `.reveal` element simply stays visible.
 */
export function Reveal({
	as: Tag = "div",
	children,
	className,
	delay = 0,
	y = 24,
}: RevealProps) {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;
		if (document.documentElement.dataset.motion !== "on") return;
		registerGsap();

		const ctx = gsap.context(() => {
			gsap.fromTo(
				el,
				{ y, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.9,
					delay,
					ease: "power2.out",
					scrollTrigger: {
						trigger: el,
						start: "top 86%",
						once: true,
					},
				},
			);
		}, el);

		return () => ctx.revert();
	}, [delay, y]);

	return (
		<Tag ref={ref} className={["reveal", className].filter(Boolean).join(" ")}>
			{children}
		</Tag>
	);
}
