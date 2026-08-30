/**
 * A section's horizon: the hairline seam, with the section's name sitting just
 * above it. Sections further along the path use a fainter horizon, so the page
 * reads as distance travelled.
 *
 * This replaces the old fixed lower-left marker. The WORDS are unchanged — they
 * are specific to the journey and worth keeping. What changed is the delivery:
 * the "// UPPERCASE MONO" eyebrow was the templated part.
 */
export function SectionHorizon({
	label,
	distance = "mid",
}: {
	label: string;
	distance?: "near" | "mid" | "far";
}) {
	return (
		<div className="section-horizon">
			<span className="marker-label">{label}</span>
			<hr className="horizon" data-distance={distance} />
		</div>
	);
}
