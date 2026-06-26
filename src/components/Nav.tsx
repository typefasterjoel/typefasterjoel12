import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { scrollToTarget } from "#/lib/motion";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const SECTIONS = [
	{ id: "work", label: "Work" },
	{ id: "about", label: "About" },
	{ id: "contact", label: "Contact" },
];

export function Nav() {
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const goTo = (id: string) => {
		setMenuOpen(false);
		if (pathname === "/") {
			scrollToTarget(`#${id}`);
		} else {
			navigate({ to: "/", hash: id });
		}
	};

	return (
		<header className="site-nav" data-scrolled={scrolled}>
			<Link to="/" className="nav-brand" aria-label="typefasterjoel, home">
				<Logo className="logo" />
				<span className="nav-wordmark">typefasterjoel</span>
			</Link>

			<nav className="nav-links" aria-label="Primary">
				{SECTIONS.map((s) => (
					<button
						key={s.id}
						type="button"
						className="nav-link"
						onClick={() => goTo(s.id)}
					>
						{s.label}
					</button>
				))}
				<Link to="/resume" className="nav-link">
					Resume
				</Link>
			</nav>

			<div className="nav-actions">
				<ThemeToggle />
				<button
					type="button"
					className="icon-btn nav-burger"
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen((v) => !v)}
				>
					{menuOpen ? (
						<X size={18} strokeWidth={1.75} />
					) : (
						<Menu size={18} strokeWidth={1.75} />
					)}
				</button>
			</div>

			{menuOpen && (
				<div className="nav-sheet">
					{SECTIONS.map((s) => (
						<button
							key={s.id}
							type="button"
							className="nav-sheet-link"
							onClick={() => goTo(s.id)}
						>
							{s.label}
							<span className="arrow" aria-hidden="true">
								<ArrowRight size={16} />
							</span>
						</button>
					))}
					<Link
						to="/resume"
						className="nav-sheet-link"
						onClick={() => setMenuOpen(false)}
					>
						Resume
						<span className="arrow" aria-hidden="true">
							<ArrowRight size={16} />
						</span>
					</Link>
				</div>
			)}
		</header>
	);
}
