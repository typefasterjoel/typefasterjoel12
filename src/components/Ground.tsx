/**
 * The ground plane — everything below the horizon.
 *
 * The sky is fixed behind the whole document. The ground is an opaque surface
 * that begins where the hero ends and scrolls up over the sky, so the seam
 * between them is a real edge rather than a drawn line. That edge is the
 * horizon: cross it and you are walking, not looking.
 *
 * Routes without a hero (a case study, the work index) are ground from their
 * first pixel — the visitor is already on the path.
 */
export function Ground({ children }: { children: React.ReactNode }) {
	return <div className="ground">{children}</div>;
}
