import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { btnClass } from "#/components/Button";
import { Reveal } from "#/components/Reveal";
import { Timeline } from "#/components/Timeline";
import { getRecentRoles, roles } from "#/data/resume";

export function Career() {
	const startYear = roles[roles.length - 1].start.match(/\d{4}/)?.[0] ?? "2009";
	const yearsSpan = new Date().getFullYear() - Number(startYear);

	return (
		<section className="section container" id="career">
			<div className="section-head">
				<Reveal>
					<h2 className="h2">Where I've traveled.</h2>
				</Reveal>
				<Reveal delay={0.06}>
					<p className="small">
						{roles.length} roles · {yearsSpan}+ years of practice.
					</p>
				</Reveal>
			</div>

			<Timeline entries={getRecentRoles(3)} condensed />

			<Reveal delay={0.08}>
				<div className="career-cta">
					<Link to="/resume" className={btnClass({ variant: "outline" })}>
						See the full trail
						<span className="arrow" aria-hidden="true">
							<ArrowRight size={16} />
						</span>
					</Link>
				</div>
			</Reveal>
		</section>
	);
}
