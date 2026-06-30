import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "#/components/Reveal";
import { projects } from "#/data/projects";

/** Points of interest — selected work as an editorial list. */
export function Work() {
	return (
		<section className="section container" id="work">
			<div className="section-head">
				<Reveal>
					<h2 className="h2">Places worth stopping.</h2>
				</Reveal>
				<Reveal delay={0.08}>
					<p className="small">A selection of work worth the detour — tap any to travel in.</p>
				</Reveal>
			</div>

			<ul className="work-list" role="list">
				{projects.map((p, i) => (
					<Reveal key={p.slug} delay={i * 0.06}>
						<li className="work-list-item">
							<Link
								to="/work/$slug"
								params={{ slug: p.slug }}
								className="work-list-link"
							>
								<div className="work-list-row">
									<span className="work-list-index mono-label">
										{String(i + 1).padStart(2, "0")}
									</span>
									<span className="work-list-title">{p.title}</span>
									<span className="work-list-summary">{p.summary}</span>
									<span className="work-list-arrow" aria-hidden="true">
										<ArrowUpRight size={15} />
									</span>
								</div>
								{/* Wrapper enables smooth CSS grid height animation — no layout jump */}
								<div className="work-list-desc-wrapper">
									<p className="work-list-desc">
										{p.intro.slice(0, 140).trimEnd()}…
									</p>
								</div>
							</Link>
						</li>
					</Reveal>
				))}
			</ul>
		</section>
	);
}
