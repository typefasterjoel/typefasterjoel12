import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

/** Shared with the form UI for client-side field errors. */
export const contactSchema = z.object({
	name: z.string().min(1, "your name?"),
	email: z.string().email("a real email helps"),
	message: z.string().min(4, "a few more words?"),
});

const contactInput = contactSchema.extend({
	/** honeypot — humans never see the field; non-empty means bot (checked in the handler, not here, so bots get a fake success instead of a validation error) */
	company: z.string().optional(),
	/** time-trap — when the form was first rendered (epoch ms) */
	startedAt: z.number(),
});

export type ContactResult = {
	status: "sent" | "fallback" | "rate_limited";
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
/** Best-effort, in-memory, per-node — plenty for a portfolio inbox. */
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const recent = (submissions.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= MAX_PER_WINDOW) {
		submissions.set(ip, recent);
		return true;
	}
	recent.push(now);
	submissions.set(ip, recent);
	return false;
}

export const sendContact = createServerFn({ method: "POST" })
	.inputValidator(contactInput)
	.handler(async ({ data }): Promise<ContactResult> => {
		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) return { status: "fallback" };

		// Bots fill hidden fields and submit instantly. Either way, claim
		// success and send nothing — never tip them off.
		if (data.company || Date.now() - data.startedAt < 3000) {
			return { status: "sent" };
		}

		const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
		if (isRateLimited(ip)) return { status: "rate_limited" };

		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "Portfolio <contact@typefasterjoel.com>",
				to: ["joel@typefasterjoel.com"],
				reply_to: data.email,
				subject: `Portfolio note from ${data.name}`,
				text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
			}),
		});
		if (!res.ok) {
			throw new Error(`Resend responded ${res.status}`);
		}
		return { status: "sent" };
	});
