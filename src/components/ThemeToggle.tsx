import { Moon, Sun } from "lucide-react";
import { useTheme } from "#/lib/theme";

/** Day ↔ dusk toggle. Mirrors the design-system theme switch. */
export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const next = theme === "dark" ? "day" : "dusk";
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
