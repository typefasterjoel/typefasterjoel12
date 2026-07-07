import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { btnClass } from "#/components/Button";
import { CaseGallery } from "#/components/CaseGallery";
import { ImageModal } from "#/components/ImageModal";
import { LinkChip } from "#/components/LinkChip";
import { Reveal } from "#/components/Reveal";
import { Tag } from "#/components/Tag";
import { type CaseFigure, getProject, projects } from "#/data/projects";

export const Route = createFileRoute("/work/$slug")({
	component: CaseStudy,
	loader: ({ params }) => {
		const project = getProject(params.slug);
		if (!project) throw notFound();
		return { project };
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData
					? `${loaderData.project.title} | typefasterjoel`
					: "Work | typefasterjoel",
			},
		],
	}),
});

/** A real image with required alt text and an optional caption. */
function Figure({
	figure,
	priority,
	onClick,
}: {
	figure: CaseFigure;
	priority?: boolean;
	onClick?: () => void;
}) {
	const img = (
		<img
			src={figure.src}
			alt={figure.alt}
			width={figure.width}
			height={figure.height}
			loading={priority ? "eager" : "lazy"}
			decoding="async"
		/>
	);
	return (
		<figure className="case-figure case-figure--img">
			{onClick ? (
				<button
					type="button"
					className="case-figure-trigger"
					onClick={onClick}
					aria-label={`Open ${figure.alt} full-screen`}
				>
					{img}
				</button>
			) : (
				img
			)}
			{figure.caption && (
				<figcaption className="mono-label">{figure.caption}</figcaption>
			)}
		</figure>
	);
}

function CaseStudy() {
	const { project } = Route.useLoaderData();
	const idx = projects.findIndex((p) => p.slug === project.slug);
	const next = projects[(idx + 1) % projects.length];
	const primaryLink =
		project.links?.find((l) => l.kind === "docs") ?? project.links?.[0];
	const [modal, setModal] = useState<{
		figures: CaseFigure[];
		index: number;
	} | null>(null);

	return (
		<article>
			<section className="case-hero container">
				<Reveal>
					<Link to="/" hash="work" className="mono-label">
						← back to the trail
					</Link>
				</Reveal>
				<Reveal delay={0.06}>
					<h1 className="h1" style={{ marginTop: "var(--s-5)" }}>
						{project.title}
					</h1>
				</Reveal>
				<Reveal delay={0.12}>
					<p
						className="body-lg measure"
						style={{ marginTop: "var(--s-5)", maxWidth: "64ch" }}
					>
						{project.intro}
					</p>
				</Reveal>
				{project.stats && project.stats.length > 0 && (
					<Reveal delay={0.18}>
						<dl className="case-stats" style={{ marginTop: "var(--s-7)" }}>
							{project.stats.map((s) => (
								<div className="case-stat" key={s.label}>
									<dt className="case-stat-value h3">{s.value}</dt>
									<dd className="mono-label">{s.label}</dd>
								</div>
							))}
						</dl>
					</Reveal>
				)}
			</section>

			<section className="section container" style={{ paddingTop: 0 }}>
				<div className="case-grid">
					<aside className="case-aside">
						{project.facts.map((f) => (
							<div className="case-meta-row" key={f.label}>
								<span className="mono-label">{f.label}</span>
								<span className="body">{f.value}</span>
							</div>
						))}
						{project.links && project.links.length > 0 && (
							<div className="stack" style={{ gap: "var(--s-2)" }}>
								{project.links.map((l) => (
									<LinkChip key={l.label} link={l} />
								))}
							</div>
						)}
						<div className="cluster" style={{ gap: "var(--s-2)" }}>
							{project.tags.map((t) => (
								<Tag key={t}>{t}</Tag>
							))}
						</div>
					</aside>

					<div className="case-prose">
						{primaryLink && (
							<Reveal>
								<a
									href={primaryLink.href}
									target={
										primaryLink.href.startsWith("http") ? "_blank" : undefined
									}
									rel={
										primaryLink.href.startsWith("http")
											? "noreferrer"
											: undefined
									}
									className={btnClass({ variant: "ink" })}
								>
									{primaryLink.label}
									<span className="arrow" aria-hidden="true">
										<ArrowUpRight size={16} />
									</span>
								</a>
							</Reveal>
						)}
						<Reveal>
							{project.cover ? (
								<Figure figure={project.cover} priority />
							) : (
								<div className="case-figure">
									<span className="mono-label">figure · coming soon</span>
								</div>
							)}
						</Reveal>
						{project.sections.map((s, i) => (
							<div key={s.heading}>
								<Reveal>
									<div style={{ marginBottom: "var(--s-7)" }}>
										<h2 className="h3">{s.heading}</h2>
										{s.body.map((para) => (
											<p key={para.slice(0, 24)}>{para}</p>
										))}
										{s.figures && s.figures.length > 0 && (
											<div
												className={
													s.figureLayout === "pair"
														? "case-figure-pair"
														: s.figureLayout === "grid"
															? "case-figure-grid"
															: "case-figure-stack"
												}
											>
												{s.figures.map((f, i) => (
													<Figure
														key={f.src}
														figure={f}
														onClick={() =>
															setModal({ figures: s.figures ?? [], index: i })
														}
													/>
												))}
											</div>
										)}
									</div>
								</Reveal>
								{project.galleryIntro && project.galleryAfterSection === i && (
									<Reveal>
										<div className="case-gallery-intro">
											{project.galleryIntro.caption && (
												<p className="mono-label case-gallery-intro-caption">
													{project.galleryIntro.caption}
												</p>
											)}
											<div className="case-figure-grid case-figure-grid--compact">
												{project.galleryIntro.figures.map((f, fi) => (
													<Figure
														key={f.src}
														figure={f}
														onClick={() =>
															setModal({
																figures: project.galleryIntro?.figures ?? [],
																index: fi,
															})
														}
													/>
												))}
											</div>
										</div>
									</Reveal>
								)}
								{project.gallery && project.galleryAfterSection === i && (
									<CaseGallery
										figures={project.gallery}
										onSlideClick={(index) =>
											setModal({ figures: project.gallery ?? [], index })
										}
									/>
								)}
							</div>
						))}
						{project.callout && (
							<Reveal>
								<aside className="case-callout">
									<span className="mono-label case-callout-eyebrow">
										{project.callout.eyebrow}
									</span>
									<h2 className="h3" style={{ marginTop: "var(--s-3)" }}>
										{project.callout.heading}
									</h2>
									<p>{project.callout.body}</p>
									{project.callout.links &&
										project.callout.links.length > 0 && (
											<div
												className="cluster"
												style={{ gap: "var(--s-2)", marginTop: "var(--s-4)" }}
											>
												{project.callout.links.map((l) => (
													<LinkChip key={l.label} link={l} />
												))}
											</div>
										)}
								</aside>
							</Reveal>
						)}
					</div>
				</div>
			</section>

			<section className="section container">
				<hr className="rule" />
				<div
					className="footer-inner"
					style={{ marginTop: "var(--s-6)", alignItems: "center" }}
				>
					<div className="stack" style={{ gap: "4px" }}>
						<span className="mono-label">{"// next destination"}</span>
						<span className="h3">{next.title}</span>
					</div>
					<Link
						to="/work/$slug"
						params={{ slug: next.slug }}
						className={btnClass({ variant: "outline" })}
					>
						Travel on
						<span className="arrow" aria-hidden="true">
							<ArrowRight size={16} />
						</span>
					</Link>
				</div>
			</section>

			{modal && (
				<ImageModal
					figures={modal.figures}
					index={modal.index}
					onIndexChange={(index) => setModal((m) => (m ? { ...m, index } : m))}
					onClose={() => setModal(null)}
				/>
			)}
		</article>
	);
}
