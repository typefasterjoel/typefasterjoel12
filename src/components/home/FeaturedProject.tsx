import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getProject } from "#/data/projects";

/**
 * The featured band — the first destination visible from the hero.
 *
 * It sits below the hero's horizon rule and *stays in the sky*: no surface
 * fill, no card, no border box. Only the aperture is opaque. That matters,
 * because an opaque band here would read as a second horizon arriving before
 * the real `.ground` does, and the hero would look like it had two seams.
 *
 * Geometry is load-bearing. The band is pinned below 66% of the viewport
 * because `SUN_Y_HORIZON` in sky-palette.ts parks the disc at 0.62 at its
 * lowest — so the sun and moon clear the band at every hour of the day. If
 * that constant ever moves, `--featured-top` in app.css moves with it.
 *
 * Everything rendered here comes from `projects.ts`: the stats, the hook and
 * the figure are the case study's own, so the hero can never drift from it.
 */
export function FeaturedProject({ slug }: { slug: string }) {
	const project = getProject(slug);
	// A drafted or renamed project drops the band rather than breaking the
	// hero — getProject already filters drafts out.
	if (!project?.featured) return null;

	const { hook, figure } = project.featured;
	const stats = project.stats ?? [];

	return (
		<div className="featured" data-featured>
			<Link
				to="/work/$slug"
				params={{ slug: project.slug }}
				className="featured-link"
				aria-label={`Read the ${project.title} case study`}
			>
				<figure className="featured-aperture">
					<img
						src={figure.src}
						alt={figure.alt}
						width={figure.width}
						height={figure.height}
						// The hero image is the LCP candidate: never lazy, and
						// hinted so it outranks the sky canvas chunk.
						loading="eager"
						fetchPriority="high"
						decoding="async"
					/>
				</figure>

				<div className="featured-body">
					<p className="featured-title">
						<span className="featured-name">{project.title}</span>
						<span className="featured-year">{project.year}</span>
					</p>

					<p className="featured-hook">{hook}</p>

					{stats.length > 0 && (
						<ul className="featured-stats">
							{stats.map((s) => (
								<li key={s.label}>
									<span className="featured-stat-value">{s.value}</span>
									<span className="featured-stat-label">{s.label}</span>
								</li>
							))}
						</ul>
					)}

					<span className="featured-cta">
						Read the case study
						<span className="arrow" aria-hidden="true">
							<ArrowRight size={16} />
						</span>
					</span>
				</div>
			</Link>
		</div>
	);
}
