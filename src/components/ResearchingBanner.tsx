import { Sparkle } from "lucide-react";

const STAGES = [
	"Searching web for contact information...",
	"Searching web for company information...",
	"Ranking and matching data...",
];

/**
 * Recreation of Prospect's AI lookup loading banner. Product UI, not site
 * chrome, so its colours are Prospect's own tokens (see .researching in
 * components.css) rather than the sky palette.
 */
export function ResearchingBanner() {
	return (
		<div className="researching" role="status">
			<span className="researching-icon" aria-hidden="true">
				<Sparkle size={16} strokeWidth={1.5} />
			</span>
			<div className="researching-text">
				<span className="researching-title">Researching...</span>
				<span className="researching-sub">
					{STAGES.map((t, i) => (
						<span key={t} className="researching-stage" aria-hidden={i > 0}>
							{t}
						</span>
					))}
				</span>
			</div>
		</div>
	);
}
