import { Reveal } from "#/components/Reveal";

/** The path — a manifesto block that sets you moving. */
export function Path() {
	return (
		<section className="section container" id="path">
			<div className="path-manifesto">
				<Reveal delay={0.08}>
					<h2 className="h2">Design and build,<br />in the same breath.</h2>
				</Reveal>

				<Reveal delay={0.18}>
					<p className="body-lg path-body">
						I have spent fifteen years in the seam between design and engineering.
						Close enough to pixels to sweat them, close enough to code to ship them.
						Not as a generalist hedge. As a conviction.
					</p>
				</Reveal>

				<Reveal delay={0.28}>
					<p className="body-lg path-body">
						What I am after is the moment something clicks. Not just functionally.
						The kind of click that makes you feel something. Clarity that feels inevitable.
						A flow that earns trust. Interfaces that solve real things without making the solving feel hard.
					</p>
				</Reveal>

				<Reveal delay={0.38}>
					<p className="body-lg path-body">
						Three things guide the work:{" "}
						<span className="accent-word">clarity</span>,{" "}
						<span className="accent-word">restraint</span>,{" "}
						<span className="accent-word">wonder</span>.
						<br />
						Not as rules. As instincts.
					</p>
				</Reveal>
			</div>
		</section>
	);
}
