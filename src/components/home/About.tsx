import { Reveal } from "#/components/Reveal";
import { Tag } from "#/components/Tag";

const SKILLS = [
	"Product design",
	"Design systems",
	"React / TypeScript",
	"Prototyping",
	"Motion",
	"Front-of-frontend",
];

/** The traveler — meeting Joel. Warmer, more intimate register. */
export function About() {
	return (
		<section className="section container" id="about">
			<div className="about-grid">
				<div>
					<Reveal>
						<h2 className="h2">Hi, I'm Joel.</h2>
					</Reveal>
					<Reveal delay={0.12}>
						<p className="body-lg" style={{ marginTop: "var(--s-5)" }}>
							Boricua, for the record. I've spent 20+ years at the seam between
							design and engineering: building design systems, shipping product
							surfaces, and caring deeply about the details most people never
							notice. I've been doing this since high school, when "building
							online products" was basically just vibes and FTP clients.
						</p>
					</Reveal>
					<Reveal delay={0.18}>
						<p className="body" style={{ marginTop: "var(--s-4)" }}>
							My career has taken some turns. Front-end work for Disney and
							Pixar through an agency, co-building health startups where the
							users were actual patients, then joining Linux Academy when it had
							20 people and leaving when it had 200+ (and my title had become
							Director of Product). These days I'm a Senior Design Engineer at Buildout,
							making the design system and the interfaces it powers.
						</p>
					</Reveal>
					<Reveal delay={0.24}>
						<p className="body" style={{ marginTop: "var(--s-4)" }}>
							Off the clock I'm playing piano, diving into video game worlds, or
							just outside.
						</p>
					</Reveal>
					<Reveal delay={0.30}>
						<div
							className="cluster"
							style={{ gap: "var(--s-2)", marginTop: "var(--s-6)" }}
						>
							{SKILLS.map((s) => (
								<Tag key={s}>{s}</Tag>
							))}
						</div>
					</Reveal>
				</div>

			</div>
		</section>
	);
}
