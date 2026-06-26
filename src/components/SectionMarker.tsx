import { useEffect, useRef, useState } from "react";

const SECTIONS = [
	{ id: "top", label: "// first light" },
	{ id: "path", label: "// the path" },
	{ id: "work", label: "// selected work" },
	{ id: "about", label: "// the traveler" },
	{ id: "career", label: "// the road taken" },
	{ id: "contact", label: "// the send-off" },
];

/**
 * Fixed vertical section label in the lower-left corner.
 * Watches each section via IntersectionObserver and crossfades the label
 * as the visitor scrolls through the page.
 */
export function SectionMarker() {
	const [active, setActive] = useState(SECTIONS[0].label);
	const [hidden, setHidden] = useState(false);
	const intersecting = useRef(new Set<string>());

	useEffect(() => {
		const update = () => {
			const current = SECTIONS.find((s) => intersecting.current.has(s.id));
			if (current) setActive(current.label);
			setHidden(intersecting.current.has("contact"));
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						intersecting.current.add(entry.target.id);
					} else {
						intersecting.current.delete(entry.target.id);
					}
				}
				update();
			},
			{ rootMargin: "-15% 0px -60% 0px", threshold: 0 },
		);

		for (const s of SECTIONS) {
			const el = document.getElementById(s.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<div className="section-marker" aria-hidden="true" data-hidden={hidden}>
			<span key={active} className="section-marker-label">
				{active}
			</span>
		</div>
	);
}
