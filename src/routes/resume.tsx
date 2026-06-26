import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { btnClass } from "#/components/Button";
import { Reveal } from "#/components/Reveal";
import { Timeline } from "#/components/Timeline";
import { roles, skills } from "#/data/resume";

export const Route = createFileRoute("/resume")({
	component: ResumePage,
	head: () => ({
		meta: [{ title: "Resume | typefasterjoel" }],
	}),
});

function ResumePage() {
	const handlePrint = () => {
		window.print();
	};

	return (
		<article className="resume-page container">
			<header className="resume-header">
				<Reveal>
					<Link to="/" className="resume-back">
						← back to the trail
					</Link>
				</Reveal>
				<Reveal delay={0.06}>
					<h1 className="h1">Joel Lopez.</h1>
				</Reveal>
				<Reveal delay={0.1}>
					<p
						className="body-lg"
						style={{ maxWidth: "52ch", marginTop: "var(--s-4)" }}
					>
						Senior Design Engineer, at the seam between design and engineering.
						15+ years shipping products, design systems, and production code.
					</p>
				</Reveal>
				<Reveal delay={0.14}>
					<div className="resume-print-btn">
						<button
							type="button"
							onClick={handlePrint}
							className={btnClass({ variant: "outline", size: "sm" })}
						>
							Print / Download PDF
							<span className="arrow" aria-hidden="true">
								<ArrowRight size={16} />
							</span>
						</button>
					</div>
				</Reveal>
			</header>

			<section className="resume-section">
				<Reveal>
					<h2 className="h3 resume-section-label">Experience</h2>
				</Reveal>
				<Timeline entries={roles} />
			</section>

			<section className="resume-section">
				<Reveal>
					<h2 className="h3 resume-section-label">Skills</h2>
				</Reveal>
				<div className="skills-grid">
					{skills.map((group, i) => (
						<Reveal key={group.label} delay={i * 0.08}>
							<div>
								<p className="skill-group-label">{group.label}</p>
								<ul className="skill-list">
									{group.items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>
						</Reveal>
					))}
				</div>
			</section>
		</article>
	);
}
