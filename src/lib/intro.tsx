import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { prefersReducedMotion } from "./motion";

const SESSION_KEY = "tfj-intro-played";

type IntroValue = {
	/** true once the hero is cleared to "crest" into view */
	ready: boolean;
	/** whether the preloader should be skipped (replayed nav / reduced motion) */
	skip: boolean;
	/** called by the preloader when its dawn-break finishes */
	complete: () => void;
};

const IntroContext = createContext<IntroValue | null>(null);

function shouldSkip(): boolean {
	if (typeof window === "undefined") return false;
	try {
		if (sessionStorage.getItem(SESSION_KEY) === "1") return true;
	} catch {
		/* ignore */
	}
	return prefersReducedMotion();
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
	const [skip] = useState(shouldSkip);
	const [ready, setReady] = useState(skip);

	// Stable across renders so flipping `ready` doesn't recreate this and
	// retrigger the preloader's effect (which would restart its timeline).
	const complete = useCallback(() => {
		try {
			sessionStorage.setItem(SESSION_KEY, "1");
		} catch {
			/* ignore */
		}
		setReady(true);
	}, []);

	const value = useMemo<IntroValue>(
		() => ({ ready, skip, complete }),
		[ready, skip, complete],
	);

	return (
		<IntroContext.Provider value={value}>{children}</IntroContext.Provider>
	);
}

export function useIntro(): IntroValue {
	const ctx = useContext(IntroContext);
	if (!ctx) throw new Error("useIntro must be used within IntroProvider");
	return ctx;
}
