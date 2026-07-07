import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Reveal } from "#/components/Reveal";
import { SideQuestCard } from "#/components/SideQuestCard";
import { SideQuestModal } from "#/components/SideQuestModal";
import { Tag } from "#/components/Tag";
import { projects } from "#/data/projects";
import { type SideQuest, sideQuests } from "#/data/side-quests";

export const Route = createFileRoute("/work/")({
	component: WorkIndex,
	head: () => ({
		meta: [{ title: "Work | typefasterjoel" }],
	}),
});

function WorkIndex() {
	const [open, setOpen] = useState<{ quest: SideQuest; rect: DOMRect } | null>(
		null,
	);

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

				{sideQuests.length > 0 && (
					<div id="side-quests" style={{ marginTop: "var(--s-9)" }}>
						<Reveal>
							<p className="mono-label">{"// side quests"}</p>
							<h2 className="h3" style={{ marginTop: "var(--s-2)" }}>
								A few smaller detours.
							</h2>
						</Reveal>
						<div className="side-quest-row">
							{sideQuests.map((q) => (
								<Reveal key={q.slug}>
									<SideQuestCard
										quest={q}
										onOpen={(quest, rect) => setOpen({ quest, rect })}
									/>
								</Reveal>
							))}
						</div>
					</div>
				)}
			</section>

			{open && (
				<SideQuestModal
					quest={open.quest}
					originRect={open.rect}
					onClose={() => setOpen(null)}
				/>
			)}
		</article>
	);
}
