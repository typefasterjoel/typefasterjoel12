import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Reveal } from "#/components/Reveal";
import { SideQuestCard } from "#/components/SideQuestCard";
import { SideQuestModal } from "#/components/SideQuestModal";
import { projects } from "#/data/projects";
import { type SideQuest, sideQuests } from "#/data/side-quests";

/** Points of interest — selected work as an editorial list. */
export function Work() {
	const [open, setOpen] = useState<{ quest: SideQuest; rect: DOMRect } | null>(
		null,
	);

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

			{sideQuests.length > 0 && (
				<div style={{ marginTop: "var(--s-7)" }}>
					<Reveal>
						<div
							className="cluster"
							style={{ justifyContent: "space-between", alignItems: "baseline" }}
						>
							<p className="mono-label">{"// a few side quests"}</p>
							<Link to="/work" hash="side-quests" className="mono-label">
								See all
								<span className="arrow" aria-hidden="true">
									<ArrowUpRight size={14} />
								</span>
							</Link>
						</div>
					</Reveal>
					<div className="side-quest-row">
						{sideQuests.slice(0, 3).map((q) => (
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

			{open && (
				<SideQuestModal
					quest={open.quest}
					originRect={open.rect}
					onClose={() => setOpen(null)}
				/>
			)}
		</section>
	);
}
