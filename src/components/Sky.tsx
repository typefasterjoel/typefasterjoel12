import { useEffect, useRef } from "react";
import type { SkyFieldHandle } from "#/lib/sky-field";
import { useSkyTime } from "#/lib/sky-time";

/**
 * The sky — the hour you arrived.
 *
 * The CSS gradient on `.sky-root` paints first and is the permanent fallback
 * for no-WebGL. The canvas lazily layers over it and fades in, so there is
 * never a blank frame and never a hard swap.
 *
 * Mounted once in AppShell and never torn down on navigation: the sky does not
 * restart because the visitor moved to another page. They are walking under it.
 */
export function Sky() {
	const ref = useRef<HTMLDivElement>(null);
	const fieldRef = useRef<SkyFieldHandle | null>(null);
	const { palette } = useSkyTime();

	// Keep the latest palette available to the mount effect without making the
	// canvas remount every minute.
	const paletteRef = useRef(palette);
	paletteRef.current = palette;

	useEffect(() => {
		const container = ref.current;
		if (!container) return;

		let disposed = false;

		import("#/lib/sky-field")
			.then(({ createSkyField }) => {
				if (disposed) return;
				const field = createSkyField(container);
				if (!field) return; // no WebGL2 — the CSS gradient stays
				fieldRef.current = field;
				field.setPalette(paletteRef.current);
			})
			.catch(() => {
				/* chunk failed to load — the CSS gradient stays */
			});

		return () => {
			disposed = true;
			fieldRef.current?.dispose();
			fieldRef.current = null;
		};
	}, []);

	// Push every palette change through: the 60s tick, and scrubber input.
	useEffect(() => {
		fieldRef.current?.setPalette(palette);
	}, [palette]);

	return <div className="sky-root" aria-hidden="true" ref={ref} />;
}
