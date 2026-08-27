/**
 * Raw WebGL2 renderer for the sky. One full-screen triangle, one fragment
 * shader, no buffers, no library.
 *
 * Three.js used to do this job and cost ~510KB, which is why the old
 * atmosphere had to be gated to desktops with more than two cores. Nothing
 * here is 3D, so that overhead bought nothing. This ships to phones.
 *
 * This file is COMPLETE as written. It resolves and sets every uniform the
 * finished shader will use, including ones the current shader does not yet
 * declare: `getUniformLocation` returns null for those, and `gl.uniform*` with
 * a null location is a silent no-op. Later chunks add GLSL only — do not come
 * back here to "add" a uniform.
 */
import type { SkyPalette } from "#/lib/sky-palette";
import { SKY_FRAG, SKY_VERT } from "#/lib/sky-shader";

export type SkyFieldHandle = {
	setPalette: (p: SkyPalette) => void;
	dispose: () => void;
};

/** Mote budget by device capability. Nothing else scales — there is no
    per-pixel loop to cut, unlike the raymarched attempts this replaced. */
function moteBudget(): number {
	if (typeof navigator === "undefined") return 24;
	const cores = navigator.hardwareConcurrency ?? 4;
	const small = window.matchMedia("(max-width: 820px)").matches;
	if (small || cores <= 4) return 16;
	if (cores <= 8) return 28;
	return 44;
}

function compile(
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		// Surfaced in dev; in production the CSS gradient simply remains.
		console.error("sky shader failed:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function hexToVec3(hex: string): [number, number, number] {
	const h = hex.replace("#", "");
	return [
		Number.parseInt(h.slice(0, 2), 16) / 255,
		Number.parseInt(h.slice(2, 4), 16) / 255,
		Number.parseInt(h.slice(4, 6), 16) / 255,
	];
}

export function createSkyField(container: HTMLElement): SkyFieldHandle | null {
	const canvas = document.createElement("canvas");
	canvas.className = "sky-canvas";
	canvas.setAttribute("aria-hidden", "true");

	const gl = canvas.getContext("webgl2", {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
		powerPreference: "low-power",
	});
	if (!gl) return null;

	const vert = compile(gl, gl.VERTEX_SHADER, SKY_VERT);
	const frag = compile(gl, gl.FRAGMENT_SHADER, SKY_FRAG);
	if (!vert || !frag) return null;

	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, vert);
	gl.attachShader(program, frag);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("sky program failed:", gl.getProgramInfoLog(program));
		return null;
	}
	// biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL call, not a React hook
	gl.useProgram(program);
	// Shaders are linked into the program; the objects themselves are done.
	gl.deleteShader(vert);
	gl.deleteShader(frag);

	const u = (name: string) => gl.getUniformLocation(program, name);
	const loc = {
		resolution: u("uResolution"),
		time: u("uTime"),
		skyHigh: u("uSkyHigh"),
		skyLow: u("uSkyLow"),
		light: u("uLight"),
		sunPos: u("uSunPos"),
		rayStrength: u("uRayStrength"),
		starOpacity: u("uStarOpacity"),
		isNight: u("uIsNight"),
		motion: u("uMotion"),
		moteCount: u("uMoteCount"),
	};

	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
	gl.uniform1f(loc.motion, reduced.matches ? 0.1 : 1);
	gl.uniform1f(loc.moteCount, moteBudget());

	container.appendChild(canvas);

	let disposed = false;
	let raf = 0;
	let running = true;
	const started = performance.now();

	const resize = () => {
		// Cap DPR: the sky is a soft gradient, so rendering it at 3x buys
		// nothing visible and costs real fill rate on phones.
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = Math.max(1, Math.floor(container.clientWidth * dpr));
		const h = Math.max(1, Math.floor(container.clientHeight * dpr));
		if (canvas.width === w && canvas.height === h) return;
		canvas.width = w;
		canvas.height = h;
		gl.viewport(0, 0, w, h);
		gl.uniform2f(loc.resolution, w, h);
	};
	resize();

	const frame = () => {
		if (disposed || !running) return;
		gl.uniform1f(loc.time, (performance.now() - started) / 1000);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		raf = requestAnimationFrame(frame);
	};

	const onVisibility = () => {
		// Nothing to render into a hidden tab.
		const visible = document.visibilityState === "visible";
		if (visible && !running) {
			running = true;
			raf = requestAnimationFrame(frame);
		} else if (!visible && running) {
			running = false;
			cancelAnimationFrame(raf);
		}
	};

	const onMotionChange = () => {
		gl.useProgram(program);
		gl.uniform1f(loc.motion, reduced.matches ? 0.1 : 1);
	};

	const onContextLost = (e: Event) => {
		e.preventDefault();
		running = false;
		cancelAnimationFrame(raf);
	};

	const observer = new ResizeObserver(resize);
	observer.observe(container);
	document.addEventListener("visibilitychange", onVisibility);
	reduced.addEventListener("change", onMotionChange);
	canvas.addEventListener("webglcontextlost", onContextLost);

	raf = requestAnimationFrame(frame);

	// Fade in once the first frame is on screen, so there is no hard swap
	// from the CSS gradient underneath.
	requestAnimationFrame(() => {
		canvas.dataset.ready = "true";
	});

	return {
		setPalette(p: SkyPalette) {
			if (disposed) return;
			// biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL call, not a React hook
			gl.useProgram(program);
			gl.uniform3fv(loc.skyHigh, hexToVec3(p.skyHigh));
			gl.uniform3fv(loc.skyLow, hexToVec3(p.skyLow));
			gl.uniform3fv(loc.light, hexToVec3(p.light));
			gl.uniform2f(loc.sunPos, p.sunX, p.sunY);
			gl.uniform1f(loc.rayStrength, p.rayStrength);
			gl.uniform1f(loc.starOpacity, p.starOpacity);
			gl.uniform1f(loc.isNight, p.isNight ? 1 : 0);
		},
		dispose() {
			disposed = true;
			running = false;
			cancelAnimationFrame(raf);
			observer.disconnect();
			document.removeEventListener("visibilitychange", onVisibility);
			reduced.removeEventListener("change", onMotionChange);
			canvas.removeEventListener("webglcontextlost", onContextLost);
			gl.deleteProgram(program);
			gl.getExtension("WEBGL_lose_context")?.loseContext();
			canvas.remove();
		},
	};
}
