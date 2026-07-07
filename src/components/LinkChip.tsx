import {
	ArrowUpRight,
	BookOpen,
	Frame,
	GitBranch,
	Globe,
	type LucideIcon,
	Sparkles,
} from "lucide-react";
import type { CaseLink } from "#/data/projects";

const LINK_ICON: Record<NonNullable<CaseLink["kind"]>, LucideIcon> = {
	docs: BookOpen,
	figma: Frame,
	ai: Sparkles,
	repo: GitBranch,
	site: Globe,
};

/** External-artifact pill — mirrors the `.chip` pattern used in Contact. */
export function LinkChip({ link }: { link: CaseLink }) {
	const Icon = link.kind ? LINK_ICON[link.kind] : Globe;
	const external = link.href.startsWith("http");
	return (
		<a
			className="chip"
			href={link.href}
			target={external ? "_blank" : undefined}
			rel={external ? "noreferrer" : undefined}
		>
			<Icon size={16} aria-hidden="true" />
			{link.label}
			<span className="arrow" aria-hidden="true">
				<ArrowUpRight size={16} />
			</span>
		</a>
	);
}
