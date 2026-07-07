import { ArrowUpRight } from "lucide-react";
import { Tag } from "#/components/Tag";
import type { SideQuest } from "#/data/side-quests";

type Props = {
	quest: SideQuest;
	onOpen: (quest: SideQuest, rect: DOMRect) => void;
};

export function SideQuestCard({ quest, onOpen }: Props) {
	return (
		<button
			type="button"
			className="side-quest-card"
			onClick={(e) => onOpen(quest, e.currentTarget.getBoundingClientRect())}
			aria-label={`Open ${quest.title}`}
		>
			<span className="side-quest-thumb">
				<img
					src={quest.thumbnail.src}
					alt={quest.thumbnail.alt}
					width={quest.thumbnail.width}
					height={quest.thumbnail.height}
					loading="lazy"
					decoding="async"
				/>
			</span>
			<span className="side-quest-meta">
				<span className="side-quest-title">{quest.title}</span>
				<span className="side-quest-blurb">{quest.blurb}</span>
				{quest.tags && quest.tags.length > 0 && (
					<span className="cluster" style={{ gap: "var(--s-2)" }}>
						{quest.tags.slice(0, 2).map((t) => (
							<Tag key={t}>{t}</Tag>
						))}
					</span>
				)}
			</span>
			<ArrowUpRight size={15} className="side-quest-arrow" aria-hidden="true" />
		</button>
	);
}
