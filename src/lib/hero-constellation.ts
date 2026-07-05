/**
 * The hero constellation — a quiet "aha" for anyone who moves their mouse.
 *
 * A small 2D canvas star field scoped to the hero. As the cursor moves, the
 * few nearest stars link up with thin gold lines that flow toward — and stop
 * just shy of — the "wander down" cue. The constellation is the mechanism
 * that guides the eye to the path, not a separate decoration.
 *
 * Deliberately not part of the Three.js atmosphere: mote positions live in
 * that field's vertex shader (the CPU never knows them), and this behavior
 * belongs to the landing hero alone. Cohesion is visual instead — same gold,
 * same soft-falloff dots, same twinkle — with guaranteed star density where
 * the interaction needs it. Follows the house pattern: a `create*` field
 * module returning a cleanup function, mounted by a gating component.
 */

type ThemeName = "light" | "dark";

type Palette = {
	/** star sprite tint */
	star: string;
	/** line color as rgb triple, alpha applied per segment */
	line: [number, number, number];
	starAlpha: number;
	lineAlpha: number;
};

const PALETTES: Record<ThemeName, Palette> = {
	// deeper bronze holds its own against the warm paper
	light: {
		star: "#b08a3e",
		line: [155, 120, 68],
		starAlpha: 0.5,
		lineAlpha: 0.38,
	},
	// ember gold against the terminal dark
	dark: {
		star: "#e7cd8e",
		line: [231, 205, 142],
		starAlpha: 0.5,
		lineAlpha: 0.3,
	},
};

function currentTheme(): ThemeName {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

const STAR_COUNT = 48;
/** stars within this radius of the pointer become chain candidates */
const LINK_RADIUS = 180;
const MAX_CHAIN = 4;
/** the final segment stops this far from the cue — pointing, never touching */
const ANCHOR_GAP = 12;
const IDLE_MS = 4000;

type Star = {
	/** normalized position within the hero (0–1) */
	nx: number;
	ny: number;
	radius: number;
	phase: number;
	twinkleSpeed: number;
	/** px position, computed each frame from nx/ny + drift */
	x: number;
	y: number;
};

type Segment = {
	from: number;
	/** star index, or -1 for the anchor (the cue) */
	to: number;
	alpha: number;
	target: number;
};

/** Soft-core star sprite, pre-rendered once per theme. */
function makeSprite(color: string): HTMLCanvasElement {
	const size = 32;
	const sprite = document.createElement("canvas");
	sprite.width = size;
	sprite.height = size;
	const ctx = sprite.getContext("2d");
	if (ctx) {
		const g = ctx.createRadialGradient(
			size / 2,
			size / 2,
			0,
			size / 2,
			size / 2,
			size / 2,
		);
		g.addColorStop(0, color);
		g.addColorStop(0.35, color);
		g.addColorStop(1, "transparent");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, size, size);
	}
	return sprite;
}

/**
 * Mount the constellation into `container` (the hero-filling layer), guiding
 * lines toward `anchorEl` (the "wander down" cue). Returns cleanup.
 */
export function createHeroConstellation(
	container: HTMLElement,
	anchorEl: HTMLElement,
): () => void {
	const canvas = document.createElement("canvas");
	canvas.className = "hero-constellation-canvas";
	const ctx = canvas.getContext("2d");
	if (!ctx) return () => {};
	container.appendChild(canvas);

	const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	let width = 0;
	let height = 0;

	const resize = () => {
		width = container.clientWidth;
		height = container.clientHeight;
		canvas.width = Math.max(1, Math.round(width * dpr));
		canvas.height = Math.max(1, Math.round(height * dpr));
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};
	resize();

	// ---- stars — half scattered, half seeded toward the cue's quadrant so a
	// chain toward it always has stepping stones ----
	const stars: Star[] = [];
	for (let i = 0; i < STAR_COUNT; i++) {
		const lowerRight = i >= STAR_COUNT / 2;
		stars.push({
			nx: lowerRight ? 0.45 + Math.random() * 0.55 : Math.random(),
			ny: lowerRight ? 0.45 + Math.random() * 0.55 : Math.random(),
			radius: 0.6 + Math.random(),
			phase: Math.random() * Math.PI * 2,
			twinkleSpeed: 0.4 + Math.random() * 0.6,
			x: 0,
			y: 0,
		});
	}

	let palette = PALETTES[currentTheme()];
	let sprite = makeSprite(palette.star);

	const segments = new Map<string, Segment>();

	// ---- input state ----
	let pointerX = -1;
	let pointerY = -1;
	let hasPointer = false;
	let scrollGlow = 0;
	let lastActivity = performance.now();
	/** eased hero-visibility ratio from the IntersectionObserver */
	let visibility = 1;
	let visibilityEased = 1;

	const onPointerMove = (e: PointerEvent) => {
		pointerX = e.clientX;
		pointerY = e.clientY;
		hasPointer = true;
		lastActivity = performance.now();
		start();
	};
	window.addEventListener("pointermove", onPointerMove, { passive: true });

	const onScroll = () => {
		scrollGlow = 1;
		lastActivity = performance.now();
		start();
	};
	window.addEventListener("scroll", onScroll, { passive: true });

	const io = new IntersectionObserver(
		(entries) => {
			visibility = entries[0]?.intersectionRatio ?? 0;
			if (visibility < 0.05) stop();
			else start();
		},
		{ threshold: [0, 0.05, 0.25, 0.5, 0.75, 1] },
	);
	io.observe(container);

	const ro = new ResizeObserver(() => {
		resize();
		start();
	});
	ro.observe(container);

	const themeObserver = new MutationObserver(() => {
		palette = PALETTES[currentTheme()];
		sprite = makeSprite(palette.star);
		start();
	});
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});

	// ---- per-frame logic ----
	const desired = new Map<string, number>();

	const frame = (now: number) => {
		const t = now / 1000;
		const rect = container.getBoundingClientRect();
		const anchorRect = anchorEl.getBoundingClientRect();
		const anchorX = anchorRect.left + anchorRect.width / 2 - rect.left;
		const anchorY = anchorRect.top - rect.top;

		visibilityEased += (visibility - visibilityEased) * 0.1;
		scrollGlow *= 0.96;
		const idle = now - lastActivity > IDLE_MS;

		// positions: seeded spot + slow sub-pixel wander
		for (const s of stars) {
			s.x = s.nx * width + Math.sin(t * 0.1 + s.phase) * 5;
			s.y = s.ny * height + Math.cos(t * 0.08 + s.phase * 1.7) * 5;
		}

		// which segments does this frame want?
		desired.clear();
		if (!idle) {
			if (hasPointer) {
				const px = pointerX - rect.left;
				const py = pointerY - rect.top;
				if (px >= 0 && px <= width && py >= 0 && py <= height) {
					const near = stars
						.map((s, i) => ({ i, d: Math.hypot(s.x - px, s.y - py) }))
						.filter((c) => c.d < LINK_RADIUS)
						.sort((a, b) => a.d - b.d)
						.slice(0, MAX_CHAIN);
					// chain flows toward the cue: farthest-from-anchor first
					const chain = near
						.map((c) => c.i)
						.sort(
							(a, b) =>
								Math.hypot(stars[b].x - anchorX, stars[b].y - anchorY) -
								Math.hypot(stars[a].x - anchorX, stars[a].y - anchorY),
						);
					for (let k = 0; k < chain.length - 1; k++) {
						desired.set(`${chain[k]}:${chain[k + 1]}`, 1);
					}
					if (chain.length > 0) {
						desired.set(`${chain[chain.length - 1]}:-1`, 1);
					}
				}
			}
			// scrolling alone makes the field lean toward the cue for a beat
			if (scrollGlow > 0.05) {
				const nearest = stars
					.map((s, i) => ({ i, d: Math.hypot(s.x - anchorX, s.y - anchorY) }))
					.sort((a, b) => a.d - b.d)
					.slice(0, 2);
				for (const c of nearest) {
					const key = `${c.i}:-1`;
					desired.set(key, Math.max(desired.get(key) ?? 0, scrollGlow * 0.6));
				}
			}
		}

		// reconcile: existing segments ease toward their (possibly zero) target
		for (const [key, target] of desired) {
			let seg = segments.get(key);
			if (!seg) {
				const [from, to] = key.split(":").map(Number);
				seg = { from, to, alpha: 0, target };
				segments.set(key, seg);
			}
			seg.target = target;
		}
		let maxAlpha = 0;
		for (const [key, seg] of segments) {
			if (!desired.has(key)) seg.target = 0;
			seg.alpha += (seg.target - seg.alpha) * 0.08;
			if (seg.target === 0 && seg.alpha < 0.005) segments.delete(key);
			else maxAlpha = Math.max(maxAlpha, seg.alpha);
		}

		// ---- draw ----
		ctx.clearRect(0, 0, width, height);
		const global = visibilityEased;

		for (const s of stars) {
			const twinkle = 0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.phase);
			ctx.globalAlpha = palette.starAlpha * twinkle * global;
			const r = s.radius * 4;
			ctx.drawImage(sprite, s.x - r, s.y - r, r * 2, r * 2);
		}
		ctx.globalAlpha = 1;

		const [lr, lg, lb] = palette.line;
		ctx.lineWidth = 1;
		for (const seg of segments.values()) {
			const a = stars[seg.from];
			const x1 = a.x;
			const y1 = a.y;
			let x2: number;
			let y2: number;
			const alpha = seg.alpha * palette.lineAlpha * global;
			if (alpha < 0.004) continue;
			if (seg.to === -1) {
				// final segment: stop shy of the cue, fading out as it arrives
				const dx = anchorX - x1;
				const dy = anchorY - y1;
				const dist = Math.hypot(dx, dy);
				if (dist <= ANCHOR_GAP) continue;
				const k = (dist - ANCHOR_GAP) / dist;
				x2 = x1 + dx * k;
				y2 = y1 + dy * k;
				const grad = ctx.createLinearGradient(x1, y1, x2, y2);
				grad.addColorStop(0, `rgba(${lr},${lg},${lb},${alpha})`);
				grad.addColorStop(1, `rgba(${lr},${lg},${lb},0)`);
				ctx.strokeStyle = grad;
			} else {
				const b = stars[seg.to];
				x2 = b.x;
				y2 = b.y;
				ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha})`;
			}
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}

		// once everything has settled and the visitor is idle, go fully to sleep
		if (idle && maxAlpha < 0.01 && scrollGlow < 0.05) {
			stop();
			return;
		}
		raf = requestAnimationFrame(frame);
	};

	// ---- loop control ----
	let raf = 0;
	let running = false;

	const start = () => {
		if (running || document.hidden || visibility < 0.05) return;
		running = true;
		raf = requestAnimationFrame(frame);
	};
	const stop = () => {
		if (!running) return;
		running = false;
		cancelAnimationFrame(raf);
	};

	const onVisibilityChange = () => {
		if (document.hidden) stop();
		else start();
	};
	document.addEventListener("visibilitychange", onVisibilityChange);

	start();

	return () => {
		stop();
		document.removeEventListener("visibilitychange", onVisibilityChange);
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("scroll", onScroll);
		io.disconnect();
		ro.disconnect();
		themeObserver.disconnect();
		canvas.remove();
	};
}
