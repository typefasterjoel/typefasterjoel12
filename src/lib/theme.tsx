import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { ScriptOnce } from "@tanstack/react-router";

export type Theme = "light" | "dark";

const STORAGE_KEY = "tfj-theme";

// Runs before React hydrates to set data-theme and data-motion on <html>,
// preventing any flash of unstyled content. ScriptOnce ensures it's emitted
// once in the SSR stream before children are painted.
const THEME_INIT_SCRIPT = `(function(){try{
  var d=document.documentElement;
  var stored=localStorage.getItem('${STORAGE_KEY}');
  var theme=stored;
  if(theme!=='light'&&theme!=='dark'){
    theme='dark';
  }
  d.dataset.theme=theme;
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    d.dataset.motion='on';
  }
}catch(e){}})();`;

type ThemeContextValue = {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): Theme {
	if (typeof document === "undefined") return "light";
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// Server renders light; the head script + this effect reconcile on the client.
	const [theme, setThemeState] = useState<Theme>("light");

	useEffect(() => {
		setThemeState(readTheme());
	}, []);

	const setTheme = useCallback((next: Theme) => {
		const html = document.documentElement;
		html.classList.add("theme-transitioning");
		html.dataset.theme = next;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* storage may be unavailable; theme still applies for the session */
		}
		setThemeState(next);
		setTimeout(() => html.classList.remove("theme-transitioning"), 600);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(readTheme() === "dark" ? "light" : "dark");
	}, [setTheme]);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			<ScriptOnce>{THEME_INIT_SCRIPT}</ScriptOnce>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
