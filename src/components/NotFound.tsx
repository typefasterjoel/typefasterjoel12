import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { btnClass } from "./Button";

/** Brand-voiced 404. */
export function NotFound() {
	return (
		<div className="center-screen">
			<div
				className="stack"
				style={{ gap: "var(--s-5)", alignItems: "center" }}
			>
				<p className="mono-label">{"// 404 · off the map"}</p>
				<h1 className="h1">This page types slower than I do.</h1>
				<p className="body-lg measure" style={{ textAlign: "center" }}>
					You've wandered past the edge of the trail. Nothing here yet. Let's
					get you back to the open field.
				</p>
				<Link to="/" className={btnClass({ variant: "primary" })}>
					Back to first light
					<span className="arrow" aria-hidden="true">
						<ArrowRight size={16} />
					</span>
				</Link>
			</div>
		</div>
	);
}
