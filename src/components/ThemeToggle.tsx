import { Moon, Sun } from "lucide-react";
import { type Theme, useTheme } from "#/lib/theme";

/**
 * Day ↔ dusk toggle.
 *
 * Vocabulary convention: user-facing copy says "day"/"dusk" (golden hour has
 * no plain night); everything internal — the `Theme` type, `data-theme`, the
 * storage key — stays `light`/`dark`. This map is the only crossing point.
 */
const THEME_LABEL: Record<Theme, string> = { light: "day", dark: "dusk" };

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const next = THEME_LABEL[theme === "dark" ? "light" : "dark"];
	return (
		<button
			type="button"
			className="icon-btn"
			onClick={toggleTheme}
			aria-label={`Switch to ${next}`}
			title={`Switch to ${next}`}
		>
			{theme === "dark" ? (
				<Sun size={18} strokeWidth={1.75} aria-hidden="true" />
			) : (
				<Moon size={18} strokeWidth={1.75} aria-hidden="true" />
			)}
		</button>
	);
}
