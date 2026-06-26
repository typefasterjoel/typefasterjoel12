import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "#/components/Reveal";
import { Tag } from "#/components/Tag";
import { projects } from "#/data/projects";

export const Route = createFileRoute("/work/")({
	component: WorkIndex,
	head: () => ({
		meta: [{ title: "Work | typefasterjoel" }],
	}),
});

function WorkIndex() {
	return (
		<article>
			<section className="section container">
				<Reveal>
					<Link to="/" className="mono-label">
						← back home
					</Link>
				</Reveal>

				<div className="section-head" style={{ marginTop: "var(--s-7)" }}>
					<Reveal>
						<h1 className="h1">Places worth stopping.</h1>
					</Reveal>
					<Reveal delay={0.12}>
						<p className="small">
							({String(projects.length).padStart(2, "0")}) destinations · tap
							one to travel in
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
			</section>
		</article>
	);
}
