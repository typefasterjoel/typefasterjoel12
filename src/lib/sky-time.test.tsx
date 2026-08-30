// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	GROUND_DAY,
	GROUND_NIGHT,
	getPaletteAtHour,
	INK_DAY,
	INK_NIGHT,
} from "#/lib/sky-palette";
import { SkyTimeProvider, useSkyTime } from "#/lib/sky-time";

/**
 * `ScriptOnce` needs a router context and is server-only, so it is stubbed.
 * `serverPhase` mirrors the real component: it emits the script during SSR and
 * renders nothing on the client (the emitted script removes itself on parse,
 * which is why hydration sees no node on either side).
 */
let serverPhase = false;
vi.mock("@tanstack/react-router", () => ({
	ScriptOnce: ({ children }: { children: string }) =>
		serverPhase ? (
			// biome-ignore lint/security/noDangerouslySetInnerHtml: mirrors ScriptOnce
			<script dangerouslySetInnerHTML={{ __html: String(children) }} />
		) : null,
}));

const STORAGE_KEY = "tfj-hour";

function Probe() {
	const { hour, isOverridden, setHour, clearOverride } = useSkyTime();
	return (
		<div>
			<span data-testid="hour">{hour.toFixed(3)}</span>
			<span data-testid="overridden">{String(isOverridden)}</span>
			<button type="button" data-testid="set" onClick={() => setHour(1)}>
				set
			</button>
			<button type="button" data-testid="clear" onClick={clearOverride}>
				clear
			</button>
		</div>
	);
}

const root = () => document.documentElement;
const cssVar = (name: string) => root().style.getPropertyValue(name);

beforeEach(() => {
	serverPhase = false;
	localStorage.clear();
	root().removeAttribute("style");
	root().removeAttribute("data-sky-state");
	vi.useFakeTimers({ shouldAdvanceTime: false });
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

function mount() {
	return render(
		<SkyTimeProvider>
			<Probe />
		</SkyTimeProvider>,
	);
}

describe("SkyTimeProvider", () => {
	it("adopts the visitor's real local hour, not a fixed default", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 23, 30, 0));
		const view = mount();

		expect(view.getByTestId("hour").textContent).toBe("23.500");
		expect(root().dataset.skyState).toBe("night");
		expect(cssVar("--ground")).toBe(getPaletteAtHour(23.5).ground);
		expect(cssVar("--accent")).toMatch(/^#[0-9a-f]{6}$/);
		expect(view.getByTestId("overridden").textContent).toBe("false");
	});

	it("renders the afternoon palette in the afternoon", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 14, 0, 0));
		mount();
		expect(root().dataset.skyState).toBe("day");
		expect(cssVar("--ground")).toBe(getPaletteAtHour(14).ground);
	});

	it("never paints the noon fallback over a night ground while resolving", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 23, 30, 0));
		// What the pre-hydration script leaves behind.
		root().style.setProperty("--ground", GROUND_NIGHT);
		root().dataset.skyState = "night";

		const seen: string[] = [];
		const original = root().style.setProperty.bind(root().style);
		vi.spyOn(root().style, "setProperty").mockImplementation((k, v) => {
			if (k === "--ground") seen.push(String(v));
			original(k, v);
		});

		mount();
		// Every ground written during mount must be a night ground.
		expect(seen.length).toBeGreaterThan(0);
		for (const g of seen) {
			expect(g).not.toBe(GROUND_DAY);
		}
	});

	it("ticks the clock once a minute while unattended", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 14, 0, 0));
		const view = mount();
		expect(view.getByTestId("hour").textContent).toBe("14.000");

		act(() => {
			vi.advanceTimersByTime(60_000);
		});
		expect(view.getByTestId("hour").textContent).toBe("14.017");
		expect(cssVar("--ground")).toBe(getPaletteAtHour(14 + 1 / 60).ground);
	});

	it("stops ticking once the visitor takes manual control", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 14, 0, 0));
		const view = mount();

		act(() => {
			view.getByTestId("set").click();
		});
		expect(view.getByTestId("hour").textContent).toBe("1.000");
		expect(view.getByTestId("overridden").textContent).toBe("true");
		expect(root().dataset.skyState).toBe("night");
		expect(localStorage.getItem(STORAGE_KEY)).toBe("1");

		act(() => {
			vi.setSystemTime(new Date(2026, 7, 24, 14, 30, 0));
			vi.advanceTimersByTime(30 * 60_000);
		});
		// The clock moved half an hour; the display did not.
		expect(view.getByTestId("hour").textContent).toBe("1.000");
		expect(root().dataset.skyState).toBe("night");
	});

	it("survives a reload with the override intact", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 14, 0, 0));
		const first = mount();
		act(() => {
			first.getByTestId("set").click();
		});
		cleanup();
		root().removeAttribute("style");
		root().removeAttribute("data-sky-state");

		// Fresh page, clock still says 2pm, storage still says hour 1.
		const second = mount();
		expect(second.getByTestId("hour").textContent).toBe("1.000");
		expect(second.getByTestId("overridden").textContent).toBe("true");
		expect(root().dataset.skyState).toBe("night");
	});

	it("hands authority back to the clock when the override is cleared", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 14, 0, 0));
		const view = mount();
		act(() => {
			view.getByTestId("set").click();
		});
		expect(localStorage.getItem(STORAGE_KEY)).toBe("1");

		act(() => {
			vi.setSystemTime(new Date(2026, 7, 24, 15, 0, 0));
			view.getByTestId("clear").click();
		});
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
		expect(view.getByTestId("overridden").textContent).toBe("false");
		expect(view.getByTestId("hour").textContent).toBe("15.000");
		expect(root().dataset.skyState).toBe("day");

		// And the tick is running again.
		act(() => {
			vi.advanceTimersByTime(60_000);
		});
		expect(view.getByTestId("hour").textContent).toBe("15.017");
	});
});

describe("SSR handoff", () => {
	it("hydrates the SSR markup without a mismatch warning", async () => {
		vi.setSystemTime(new Date(2026, 7, 24, 23, 30, 0));

		serverPhase = true;
		const html = renderToString(
			<SkyTimeProvider>
				<Probe />
			</SkyTimeProvider>,
		);
		serverPhase = false;

		// SSR emits the pre-hydration script, and renders the noon fallback,
		// because the server has no clock for this visitor's timezone.
		expect(html).toContain("<script");
		expect(html).toContain("13.000");

		// The emitted script removes itself the moment it runs, so by hydration
		// the DOM has no script node — which is what the client renders too.
		const container = document.createElement("div");
		container.innerHTML = html.replace(/<script[\s\S]*?<\/script>/, "");
		document.body.appendChild(container);

		const errors: unknown[][] = [];
		vi.spyOn(console, "error").mockImplementation((...args) => {
			errors.push(args);
		});
		// React 19 reports a hydration mismatch through onRecoverableError, not
		// through console.error — a console spy alone silently passes. (Verified:
		// corrupting the SSR markup leaves the console spy empty and fills this.)
		const recovered: string[] = [];

		await act(async () => {
			hydrateRoot(
				container,
				<SkyTimeProvider>
					<Probe />
				</SkyTimeProvider>,
				{
					onRecoverableError: (error) => {
						recovered.push(String(error));
					},
				},
			);
		});

		expect(recovered).toEqual([]);
		expect(errors).toEqual([]);
		// And the real hour has taken over by the time hydration settles.
		expect(container.querySelector('[data-testid="hour"]')?.textContent).toBe(
			"23.500",
		);
		expect(root().dataset.skyState).toBe("night");
		expect(cssVar("--ground")).toBe(getPaletteAtHour(23.5).ground);
	});
});

/**
 * The init script is a string, so nothing type-checks it and a syntax error
 * would fail silently inside its own try/catch. These run the real emitted
 * source the way the browser would, before any React code exists.
 */
describe("pre-hydration init script", () => {
	function emittedScript(): string {
		serverPhase = true;
		const html = renderToString(
			<SkyTimeProvider>
				<span />
			</SkyTimeProvider>,
		);
		serverPhase = false;
		const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
		if (!match) throw new Error("no init script emitted");
		return match[1].replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
	}

	function runScript(src: string) {
		vi.stubGlobal("matchMedia", () => ({ matches: false }));
		// Runs the emitted source the way a browser would, outside React.
		new Function(src)();
	}

	it("paints the night ground before React exists", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 23, 30, 0));
		runScript(emittedScript());

		expect(root().dataset.skyState).toBe("night");
		expect(cssVar("--ground")).toBe(GROUND_NIGHT);
		expect(cssVar("--ink")).toBe(INK_NIGHT);
		expect(root().dataset.motion).toBe("on");
	});

	it("paints the day ground in the afternoon", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 14, 0, 0));
		runScript(emittedScript());

		expect(root().dataset.skyState).toBe("day");
		expect(cssVar("--ground")).toBe(GROUND_DAY);
		expect(cssVar("--ink")).toBe(INK_DAY);
	});

	it("honours a stored override over the wall clock", () => {
		vi.setSystemTime(new Date(2026, 7, 24, 14, 0, 0));
		localStorage.setItem(STORAGE_KEY, "1");
		runScript(emittedScript());

		expect(root().dataset.skyState).toBe("night");
		expect(cssVar("--ground")).toBe(GROUND_NIGHT);
	});

	it("agrees with the palette's own day/night split at both terminators", () => {
		const src = emittedScript();
		const hours = [5.9, 6.0, 6.1, 19.9, 20.0, 20.1];
		for (let m = 0; m < 24 * 60; m += 5) hours.push(m / 60);
		for (const h of hours) {
			localStorage.setItem(STORAGE_KEY, String(h));
			root().removeAttribute("style");
			root().removeAttribute("data-sky-state");
			runScript(src);
			expect([h, root().dataset.skyState]).toEqual([
				h,
				getPaletteAtHour(h).isNight ? "night" : "day",
			]);
		}
	});
});
