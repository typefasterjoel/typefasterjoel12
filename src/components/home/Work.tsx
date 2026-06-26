import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { btnClass } from "#/components/Button";
import { Reveal } from "#/components/Reveal";
import { Tag } from "#/components/Tag";
import { projects } from "#/data/projects";

/** Points of interest — selected work as destinations along the trail. */
export function Work() {
	return (
		<section className="section container" id="work">
			<div className="section-head">
				<Reveal>
					<h2 className="h2">Places worth stopping.</h2>
				</Reveal>
				<Reveal delay={0.12}>
					<p className="small">
						({String(projects.length).padStart(2, "0")}) destinations · tap one
						to travel in
					</p>
				</Reveal>
			</div>

			<div className="work-grid">
				{projects.map((p, i) => (
					<Reveal key={p.slug} delay={(i % 2) * 0.08}>
						<Link
							to="/work/$slug"
							params={{ slug: p.slug }}
							className="work-card"
						>
							<div className="work-thumb">
								<span className="mono-label work-index">
									{String(i + 1).padStart(2, "0")}
								</span>
								<div className="work-thumb-art">
									<span
										className="display"
										style={{
											fontSize: "clamp(56px, 9vw, 120px)",
											opacity: 0.5,
										}}
									>
										{p.title.charAt(0)}
									</span>
								</div>
							</div>
							<div className="work-meta" style={{ alignItems: "flex-start" }}>
								<div className="stack" style={{ gap: "6px" }}>
									<span className="h4">{p.title}</span>
									<span className="small">{p.summary}</span>
									<div
										className="cluster"
										style={{ gap: "var(--s-2)", marginTop: "4px" }}
									>
										{p.tags.slice(0, 2).map((t) => (
											<Tag key={t}>{t}</Tag>
										))}
									</div>
								</div>
								<span className="cluster" style={{ gap: "var(--s-2)" }}>
									<span className="mono-label">{p.year}</span>
									<span className="arrow" aria-hidden="true">
										<ArrowRight size={16} />
									</span>
								</span>
							</div>
						</Link>
					</Reveal>
				))}
			</div>

			<Reveal delay={0.16}>
				<div className="cluster" style={{ marginTop: "var(--s-6)" }}>
					<Link to="/work" className={btnClass({ variant: "outline" })}>
						See all work
						<span className="arrow" aria-hidden="true">
							<ArrowRight size={16} />
						</span>
					</Link>
				</div>
			</Reveal>
		</section>
	);
}
