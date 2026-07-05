import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { btnClass } from "#/components/Button";
import { Reveal } from "#/components/Reveal";
import { contactSchema, sendContact } from "#/lib/contact";

const SOCIALS = [
	{ label: "email", href: "mailto:joel@typefasterjoel.com" },
	{ label: "github", href: "https://github.com/typefasterjoel" },
	{ label: "linkedin", href: "https://www.linkedin.com/in/typefasterjoel" },
];

type Errors = Partial<Record<"name" | "email" | "message", string>>;
type Status =
	| "idle"
	| "sending"
	| "sent"
	| "fallback"
	| "rate_limited"
	| "error";

function mailtoHref(name: string, message: string): string {
	const subject = encodeURIComponent(`Portfolio note from ${name}`);
	const body = encodeURIComponent(message);
	return `mailto:joel@typefasterjoel.com?subject=${subject}&body=${body}`;
}

/** The send-off — an open invitation, like setting off again. */
export function Contact() {
	const [errors, setErrors] = useState<Errors>({});
	const [status, setStatus] = useState<Status>("idle");
	const startedAtRef = useRef(Date.now());

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = Object.fromEntries(new FormData(e.currentTarget));
		const result = contactSchema.safeParse(data);
		if (!result.success) {
			const f = result.error.flatten().fieldErrors;
			setErrors({
				name: f.name?.[0],
				email: f.email?.[0],
				message: f.message?.[0],
			});
			return;
		}
		setErrors({});
		setStatus("sending");
		try {
			const res = await sendContact({
				data: {
					...result.data,
					company: typeof data.company === "string" ? data.company : "",
					startedAt: startedAtRef.current,
				},
			});
			if (res.status === "fallback") {
				window.location.href = mailtoHref(
					result.data.name,
					result.data.message,
				);
			}
			setStatus(res.status);
		} catch {
			setStatus("error");
		}
	};

	const done = status === "sent" || status === "fallback";

	return (
		<section className="section container" id="contact">
			<div className="contact-grid">
				<div>
					<Reveal>
						<h2 className="h2">Let's make something worth making.</h2>
					</Reveal>
					<Reveal delay={0.14}>
						<p className="body-lg" style={{ marginTop: "var(--s-5)" }}>
							Whether it's a new product, a stuck design system, or just a good
							conversation — I'm easy to reach. I read every note and reply
							quickly.
						</p>
					</Reveal>
					<Reveal delay={0.18}>
						<div className="social-row" style={{ marginTop: "var(--s-6)" }}>
							{SOCIALS.map((s) => (
								<a
									key={s.label}
									className="chip"
									href={s.href}
									target={s.href.startsWith("http") ? "_blank" : undefined}
									rel={s.href.startsWith("http") ? "noreferrer" : undefined}
								>
									{s.label}
									<span className="arrow" aria-hidden="true">
										<ArrowRight size={16} />
									</span>
								</a>
							))}
						</div>
					</Reveal>
				</div>

				<Reveal delay={0.1}>
					{done ? (
						<div className="card card-pad" aria-live="polite">
							<p className="mono-label" style={{ marginBottom: "var(--s-3)" }}>
								{"// received"}
							</p>
							{status === "sent" ? (
								<>
									<p className="h3">Thanks. That landed.</p>
									<p className="small" style={{ marginTop: "var(--s-3)" }}>
										It's in my inbox. I'll get back to you soon.
									</p>
								</>
							) : (
								<>
									<p className="h3">Almost there.</p>
									<p className="small" style={{ marginTop: "var(--s-3)" }}>
										The form's mail service isn't set up yet, so I opened your
										email app instead — same words, same destination.
									</p>
								</>
							)}
						</div>
					) : (
						<form className="card card-pad" onSubmit={onSubmit} noValidate>
							<div className="field-row">
								<label className="field-label" htmlFor="name">
									Name
								</label>
								<input className="field" id="name" name="name" type="text" />
								{errors.name && (
									<span className="small" style={{ color: "var(--negative)" }}>
										{errors.name}
									</span>
								)}
							</div>
							<div className="field-row">
								<label className="field-label" htmlFor="email">
									Email
								</label>
								<input
									className="field"
									id="email"
									name="email"
									type="email"
									placeholder="you@example.com"
								/>
								{errors.email && (
									<span className="small" style={{ color: "var(--negative)" }}>
										{errors.email}
									</span>
								)}
							</div>
							<div className="field-row">
								<label className="field-label" htmlFor="message">
									Message
								</label>
								<textarea
									className="field"
									id="message"
									name="message"
									rows={4}
									placeholder="Tell me about it…"
								/>
								{errors.message && (
									<span className="small" style={{ color: "var(--negative)" }}>
										{errors.message}
									</span>
								)}
							</div>
							{/* Honeypot — humans never see or reach this field */}
							<div className="hp-field" aria-hidden="true">
								<label htmlFor="company">Company</label>
								<input
									id="company"
									name="company"
									type="text"
									tabIndex={-1}
									autoComplete="off"
								/>
							</div>
							{status === "rate_limited" && (
								<p className="small" aria-live="polite">
									That's a few notes in a row — give it a little while, or use
									the email chip and it'll reach me the same way.
								</p>
							)}
							{status === "error" && (
								<p className="small" aria-live="polite">
									Something snagged on the way out. Your words are still here —
									try again, or the email chip works too.
								</p>
							)}
							<button
								type="submit"
								className={btnClass({ variant: "primary" })}
								disabled={status === "sending"}
							>
								{status === "sending" ? "Sending…" : "Send it"}
								<span className="arrow" aria-hidden="true">
									<ArrowRight size={16} />
								</span>
							</button>
						</form>
					)}
				</Reveal>
			</div>
		</section>
	);
}
