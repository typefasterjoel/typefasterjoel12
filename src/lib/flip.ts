export type Rect = {
	top: number;
	left: number;
	width: number;
	height: number;
};

/**
 * FLIP-style transform: the delta that makes `target` (already laid out at
 * its natural position/size) visually overlay `origin`. Animate x/y/scaleX/
 * scaleY from this result down to 0/0/1/1 to "zoom" target in from origin,
 * or from 0/0/1/1 up to this result to zoom it back out.
 */
export function computeFlipTransform(origin: Rect, target: Rect) {
	const originCenterX = origin.left + origin.width / 2;
	const originCenterY = origin.top + origin.height / 2;
	const targetCenterX = target.left + target.width / 2;
	const targetCenterY = target.top + target.height / 2;

	return {
		x: originCenterX - targetCenterX,
		y: originCenterY - targetCenterY,
		scaleX: origin.width / target.width,
		scaleY: origin.height / target.height,
	};
}
