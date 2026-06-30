import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { btnClass } from "#/components/Button";
import { Reveal } from "#/components/Reveal";

const schema = z.object({
  name: z.string().min(1, "your name?"),
  email: z.string().email("a real email helps"),
  message: z.string().min(4, "a few more words?"),
});

const SOCIALS = [
  { label: "email", href: "mailto:joel@typefasterjoel.com" },
  { label: "github", href: "https://github.com/typefasterjoel" },
  { label: "linkedin", href: "https://www.linkedin.com/in/typefasterjoel" },
];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

/** The send-off — an open invitation, like setting off again. */
export function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const result = schema.safeParse(data);
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
    setSent(true);
  };

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
              conversation — I'm easy to reach. I read every note and reply quickly.
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
          {sent ? (
            <div className="card card-pad" aria-live="polite">
              <p className="mono-label" style={{ marginBottom: "var(--s-3)" }}>
                {"// received"}
              </p>
              <p className="h3">Thanks. That landed.</p>
              <p className="small" style={{ marginTop: "var(--s-3)" }}>
                I'll get back to you soon. (This is a demo form, so nothing was
                actually sent. Wire it to your inbox when you're ready.)
              </p>
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
              <button
                type="submit"
                className={btnClass({ variant: "primary" })}
              >
                Send it
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
