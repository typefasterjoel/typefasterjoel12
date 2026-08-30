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
 *
 * `.ground` (this outer div) carries the opaque background and never has its
 * own opacity touched. `.ground-content` (the inner one) is what
 * RouteTransition fades on navigation — CSS opacity makes an element's own
 * background transparent too, so fading `.ground` itself would expose the
 * fixed sky behind it for a frame. See RouteTransition.tsx.
 */
export function Ground({ children }: { children: React.ReactNode }) {
	return (
		<div className="ground">
			<div className="ground-content">{children}</div>
		</div>
	);
}
