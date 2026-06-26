/**
 * Phase 2 — the drifting golden-hour motes.
 *
 * A lightweight Three.js point field of slow-rising gold pollen layered over the
 * CSS atmosphere. Loaded lazily (dynamic import from `Atmosphere.tsx`) and only
 * on capable desktops, so mobile / reduced-motion visitors never download Three.
 *
 * All motion lives in the vertex shader (drift + sway + parallax with wrapping),
 * so the per-frame CPU cost is just a handful of uniform updates. The field reacts
 * to: pointer (eased parallax), scroll (gentle vertical drift), and theme changes
 * (gold dust on light "studio" / glowing embers on dark "terminal"). It pauses
 * when the tab is hidden and freezes if the visitor enables reduced motion.
 */
import * as THREE from "three";

type ThemeName = "light" | "dark";

type Palette = {
	color: THREE.Color;
	opacity: number;
	additive: boolean;
};

const PALETTES: Record<ThemeName, Palette> = {
	// soft floating gold dust over warm paper
	light: { color: new THREE.Color("#c9a24a"), opacity: 0.5, additive: false },
	// glowing pollen / embers against the terminal dark
	dark: { color: new THREE.Color("#e7cd8e"), opacity: 0.85, additive: true },
};

function currentTheme(): ThemeName {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

const HALF_X = 22;
const HALF_Y = 14;
const HALF_Z = 6;

const vertexShader = /* glsl */ `
	uniform float uTime;
	uniform float uPixelRatio;
	uniform float uSizeScale;
	uniform float uBoundsH;
	uniform float uBoundsMinY;
	uniform vec2 uPointer;
	uniform float uScroll;

	attribute float aSize;
	attribute float aSeed;
	attribute float aSpeed;

	varying float vAlpha;

	void main() {
		vec3 pos = position;
		float s = aSeed * 6.2831853;

		// gentle upward drift, wrapped within the field
		float y = pos.y + uTime * aSpeed;
		pos.y = mod(y - uBoundsMinY, uBoundsH) + uBoundsMinY;

		// lateral sway + slow depth bob
		pos.x += sin(uTime * 0.25 + s) * 0.7;
		pos.z += cos(uTime * 0.18 + s) * 0.5;

		// parallax — nearer motes shift more with pointer / scroll
		float depth = (pos.z + 6.0) / 12.0;
		pos.x += uPointer.x * (0.6 + depth * 1.8);
		pos.y += uPointer.y * (0.4 + depth * 1.2);
		pos.y += uScroll * (0.5 + depth * 1.5);

		vec4 mv = modelViewMatrix * vec4(pos, 1.0);
		gl_Position = projectionMatrix * mv;

		gl_PointSize = clamp(aSize * uSizeScale * uPixelRatio / -mv.z, 0.0, 64.0);

		// soft twinkle, faded toward the near / far edges of the field
		float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed) + s);
		float edgeFade = smoothstep(0.0, 0.18, depth) * (1.0 - smoothstep(0.82, 1.0, depth));
		vAlpha = twinkle * edgeFade;
	}
`;

const fragmentShader = /* glsl */ `
	uniform vec3 uColor;
	uniform float uOpacity;

	varying float vAlpha;

	void main() {
		float d = length(gl_PointCoord - vec2(0.5));
		if (d > 0.5) discard;
		float core = smoothstep(0.5, 0.0, d);
		gl_FragColor = vec4(uColor, pow(core, 1.6) * vAlpha * uOpacity);
	}
`;

/**
 * Mount the mote field into `container`. Returns a cleanup function that stops
 * the loop, removes listeners, disposes GPU resources and removes the canvas.
 */
export function createAtmosphereField(container: HTMLElement): () => void {
	let renderer: THREE.WebGLRenderer;
	try {
		renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: false,
			powerPreference: "low-power",
		});
	} catch {
		// WebGL unavailable — the CSS atmosphere remains the experience.
		return () => {};
	}

	const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	let width = container.clientWidth || window.innerWidth;
	let height = container.clientHeight || window.innerHeight;
	renderer.setPixelRatio(dpr);
	renderer.setSize(width, height, false);
	renderer.setClearColor(0x000000, 0);

	const canvas = renderer.domElement;
	canvas.className = "atmosphere-canvas";
	container.appendChild(canvas);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
	camera.position.z = 14;

	// Fewer motes on modest machines; the field reads fine either way.
	const cores = navigator.hardwareConcurrency || 8;
	const count = cores <= 4 ? 160 : 260;

	const positions = new Float32Array(count * 3);
	const sizes = new Float32Array(count);
	const seeds = new Float32Array(count);
	const speeds = new Float32Array(count);

	for (let i = 0; i < count; i++) {
		positions[i * 3 + 0] = (Math.random() * 2 - 1) * HALF_X;
		positions[i * 3 + 1] = (Math.random() * 2 - 1) * HALF_Y;
		positions[i * 3 + 2] = (Math.random() * 2 - 1) * HALF_Z;
		sizes[i] = 6 + Math.random() * 22;
		seeds[i] = Math.random();
		speeds[i] = 0.25 + Math.random() * 0.6;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
	geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

	const palette = PALETTES[currentTheme()];
	const uniforms = {
		uTime: { value: 0 },
		uPixelRatio: { value: dpr },
		uSizeScale: { value: 9 },
		uBoundsH: { value: HALF_Y * 2 },
		uBoundsMinY: { value: -HALF_Y },
		uPointer: { value: new THREE.Vector2(0, 0) },
		uScroll: { value: 0 },
		uColor: { value: palette.color.clone() },
		uOpacity: { value: palette.opacity },
	};

	const material = new THREE.ShaderMaterial({
		uniforms,
		vertexShader,
		fragmentShader,
		transparent: true,
		depthWrite: false,
		depthTest: false,
		blending: palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
	});

	const points = new THREE.Points(geometry, material);
	points.frustumCulled = false;
	scene.add(points);

	// ---- interaction: scroll target only (pointer parallax disabled) ----
	let scrollTarget = 0;

	const onScroll = () => {
		const max = Math.max(
			1,
			document.documentElement.scrollHeight - window.innerHeight,
		);
		scrollTarget = (Math.min(1, window.scrollY / max) * 2 - 1) * 1.4;
	};
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	// ---- theme reactivity ----
	const themeObserver = new MutationObserver(() => {
		const p = PALETTES[currentTheme()];
		uniforms.uColor.value.copy(p.color);
		uniforms.uOpacity.value = p.opacity;
		material.blending = p.additive
			? THREE.AdditiveBlending
			: THREE.NormalBlending;
		material.needsUpdate = true;
	});
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});

	// ---- resize ----
	const onResize = () => {
		width = container.clientWidth || window.innerWidth;
		height = container.clientHeight || window.innerHeight;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};
	window.addEventListener("resize", onResize, { passive: true });

	// ---- loop with visibility pause ----
	const timer = new THREE.Timer();
	let raf = 0;
	let running = true;

	const render = (timestamp: number) => {
		timer.update(timestamp);
		const dt = Math.min(timer.getDelta(), 0.05);
		uniforms.uTime.value += dt;

		uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.06;

		renderer.render(scene, camera);
		raf = requestAnimationFrame(render);
	};

	const start = () => {
		if (running) return;
		running = true;
		raf = requestAnimationFrame(render);
	};
	const stop = () => {
		if (!running) return;
		running = false;
		cancelAnimationFrame(raf);
	};

	const onVisibility = () => {
		if (document.hidden) stop();
		else start();
	};
	document.addEventListener("visibilitychange", onVisibility);

	// freeze gracefully if the visitor enables reduced motion mid-session
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
	const onReduce = () => {
		if (reduce.matches) stop();
		else start();
	};
	reduce.addEventListener("change", onReduce);

	// gentle fade-in once the first frame has painted
	requestAnimationFrame(() => {
		canvas.style.opacity = "1";
	});
	raf = requestAnimationFrame(render);

	return () => {
		stop();
		reduce.removeEventListener("change", onReduce);
		document.removeEventListener("visibilitychange", onVisibility);
		window.removeEventListener("scroll", onScroll);
		window.removeEventListener("resize", onResize);
		themeObserver.disconnect();
		timer.dispose();
		geometry.dispose();
		material.dispose();
		renderer.dispose();
		renderer.forceContextLoss();
		canvas.remove();
	};
}
