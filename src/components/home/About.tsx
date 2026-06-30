import { Reveal } from "#/components/Reveal";

const SKILLS = [
	"Product design",
	"Design systems",
	"React / TypeScript",
	"Prototyping",
	"Motion",
	"Front-of-frontend",
];

/** The traveler — meeting Joel. */
export function About() {
	return (
		<section className="section container" id="about">
			<div className="about-prose">
				<Reveal delay={0.08}>
					<h2 className="h2">Hi, I'm Joel.</h2>
				</Reveal>

				<Reveal delay={0.14}>
					<p className="body-lg about-body">
						Boricua, for the record. I've spent 20+ years at the seam between
						design and engineering: building design systems, shipping product
						surfaces, and caring deeply about the details most people never
						notice.
					</p>
				</Reveal>

				<Reveal delay={0.2}>
					<p className="body about-body">
						My career has taken some turns. Front-end work for Disney and Pixar
						through an agency, co-building health startups where the users were
						actual patients, then joining Linux Academy when it had 20 people and
						leaving when it had 200+. These days I'm a Senior Design Engineer at
						Buildout, making the design system and the interfaces it powers.
					</p>
				</Reveal>

				<Reveal delay={0.26}>
					<p className="body about-body">
						Off the clock: piano, video games, and outside.
					</p>
				</Reveal>

				<Reveal delay={0.32}>
					<ul className="skills-inline" aria-label="Skills">
						{SKILLS.map((s) => (
							<li key={s}>
								<span className="skills-marker" aria-hidden="true">//</span>
								{s}
							</li>
						))}
					</ul>
				</Reveal>
			</div>
		</section>
	);
}
