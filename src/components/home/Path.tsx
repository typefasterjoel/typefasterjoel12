import { Reveal } from "#/components/Reveal";

const PRINCIPLES = [
	{ index: "(01)", label: "clarity", note: "say the true thing, plainly." },
	{ index: "(02)", label: "restraint", note: "every element earns its place." },
	{ index: "(03)", label: "wonder", note: "leave room for a little delight." },
];

/** The path — a short statement that sets you moving down the page. */
export function Path() {
	return (
		<section className="section container" id="path">
			<div className="measure" style={{ maxWidth: "62ch" }}>
				<Reveal>
					<h2 className="h2">Design and build, in the same breath.</h2>
				</Reveal>
				<Reveal delay={0.12}>
					<p className="body-lg" style={{ marginTop: "var(--s-5)" }}>
						I live in the seam between design and engineering, close enough to
						the pixels to sweat them, close enough to the code to ship them.
						What follows is a short trail: a few places I've been, and the way I
						tend to travel.
					</p>
				</Reveal>
			</div>

			<div className="principles" style={{ marginTop: "var(--s-8)" }}>
				{PRINCIPLES.map((p, i) => (
					<Reveal key={p.label} delay={i * 0.08}>
						<div className="stack" style={{ gap: "var(--s-2)" }}>
							<span className="mono-label">{p.index}</span>
							<span className="h3">{p.label}</span>
							<span className="small">{p.note}</span>
						</div>
					</Reveal>
				))}
			</div>
		</section>
	);
}
