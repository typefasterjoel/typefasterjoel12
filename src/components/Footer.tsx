import { scrollToTarget } from "#/lib/motion";
import { Logo } from "./Logo";

export function Footer() {
	return (
		<footer className="site-footer">
			<div className="container footer-inner">
				<div className="cluster">
					<Logo
						className="logo"
						style={{ width: 28, color: "var(--accent)" }}
					/>
					<span className="small">
						Made in a browser, mostly at night. © 2026 joel.
					</span>
				</div>
				<button
					type="button"
					className="mono-label"
					style={{ background: "none", border: "none", cursor: "pointer" }}
					onClick={() => scrollToTarget("body", { offset: 0 })}
				>
					back to first light ↑
				</button>
			</div>
		</footer>
	);
}
