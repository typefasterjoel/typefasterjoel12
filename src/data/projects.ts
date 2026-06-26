/** An image/figure with required alt text and an optional visible caption. */
export type CaseFigure = {
	/** path under /public, e.g. "/work/blueprint/tokens.png" */
	src: string;
	/** required — accessibility, not optional */
	alt: string;
	caption?: string;
	/** intrinsic size, to reserve space and avoid layout shift */
	width?: number;
	height?: number;
};

/** A prominent external artifact (live docs, Figma, LLM docs). */
export type CaseLink = {
	label: string;
	href: string;
	/** short descriptor, e.g. "buildoutinc.github.io" */
	note?: string;
	/** drives the icon; the component picks the lucide glyph */
	kind?: "docs" | "figma" | "ai" | "repo" | "site";
};

/** A featured differentiator callout (e.g. the AI angle). */
export type CaseCallout = {
	/** mono eyebrow, e.g. "// built for agents" */
	eyebrow: string;
	heading: string;
	body: string;
	links?: CaseLink[];
};

/** A punchy hero stat, distinct from the sidebar facts. */
export type CaseStat = { value: string; label: string };

export type CaseSection = {
	heading: string;
	body: string[];
	/** figures rendered after this section's prose */
	figures?: CaseFigure[];
	/** how multiple figures in this section are laid out; defaults to "stack" */
	figureLayout?: "stack" | "pair" | "grid";
};

export type Project = {
	slug: string;
	title: string;
	year: string;
	role: string;
	/** one-line summary for the work grid */
	summary: string;
	tags: string[];
	/** longer intro shown at the top of the case study */
	intro: string;
	sections: CaseSection[];
	/** quick facts shown in the case-study sidebar */
	facts: { label: string; value: string }[];
	/** hero stat strip, shown above the grid */
	stats?: CaseStat[];
	/** prominent external artifacts, shown in the sidebar */
	links?: CaseLink[];
	/** featured differentiator block */
	callout?: CaseCallout;
	/** lead figure that replaces the "coming soon" placeholder */
	cover?: CaseFigure;
	/** full-bleed carousel; rendered after sections[galleryAfterSection] */
	gallery?: CaseFigure[];
	galleryAfterSection?: number;
};

/**
 * Placeholder, on-brand content — real projects swap in later. Voice follows
 * the design system: sentence case, friendly, concise, lightly playful.
 */
export const projects: Project[] = [
	// ── Blueprint ──────────────────────────────────────────────────────────
	// TODO(joel): confirm the values flagged `TODO` below before publishing —
	// real numbers only. Drop visuals into /public/work/blueprint/ and wire
	// up `cover` + per-section `figures` (see the commented stubs).
	{
		slug: "blueprint",
		title: "Blueprint design system",
		year: "2025 – present",
		role: "Senior design engineer · creator",
		summary:
			"One design language for four Buildout products — tokens, components, docs, a private registry, and pages built for AI agents.",
		tags: ["Design systems", "React", "Tokens", "AI tooling"],
		intro:
			"Blueprint is the design system I created at Buildout — one shared language for four products that used to look like four different companies. I built the whole stack: tokens, components, theme, docs, and a private registry to ship it. The hard part wasn't the design; it was getting four apps to adopt it without stopping the world.",
		stats: [
			{ value: "4", label: "products, one language" },
			{ value: "68", label: "components shipped" },
			{ value: "170+", label: "screens designed" },
		],
		facts: [
			{ label: "Role", value: "Creator · senior design engineer" },
			{ label: "Year", value: "2025 – present" },
			{ label: "Scope", value: "Tokens · components · theme · docs · registry · Claude skill" },
			{ label: "Stack", value: "React · TypeScript · tokens · private npm registry" },
		],
		links: [
			{
				label: "Read the docs",
				href: "https://buildoutinc.github.io/blueprint/docs",
				note: "buildoutinc.github.io",
				kind: "docs",
			},
			{
				
				label: "Docs for LLMs",
				href: "https://buildoutinc.github.io/blueprint/llms.txt",
				kind: "ai",
			},
			{
				// TODO(joel): paste the Figma library share link
				label: "Figma library",
				href: "https://www.figma.com/",
				kind: "figma",
			},
		],
		cover: {
			src: "/work/blueprint/cover.svg",
			alt: "Blueprint component library overview",
			width: 1600,
			height: 900,
		},
		galleryAfterSection: 1,
		gallery: [
			{ src: "/work/blueprint/gallery-1.svg", alt: "Buildout product — listings screen", caption: "Listings" },
			{ src: "/work/blueprint/gallery-2.svg", alt: "Buildout product — detail view", caption: "Detail view" },
			{ src: "/work/blueprint/gallery-3.svg", alt: "Buildout product — dashboard", caption: "Dashboard" },
			{ src: "/work/blueprint/gallery-4.svg", alt: "Buildout product — form flow", caption: "Form flow" },
		],
		callout: {
			eyebrow: "// built for humans and machines",
			heading: "A Claude skill ships with the system",
			body: "Blueprint ships a Claude skill alongside the component library. Ask it to build a feature and it walks the agent through installation, handles private registry auth, explains how components fit together in a front-end context, and bridges to the per-component LLM doc page when it needs the full API. It triggers on a slash command or activates on its own the moment you mention a component or describe a UI. The system doesn't wait to be rediscovered in a chat window — it shows up.",
			links: [
				{
					
					label: "See the AI docs",
					href: "https://buildoutinc.github.io/blueprint/llms.txt",
					kind: "ai",
				},
			],
		},
		sections: [
			{
				heading: "The challenge",
				body: [
					"Buildout ran four products, and each had grown its own design language. Four takes on a button, four ideas of what “primary” meant, four palettes that almost matched. Nothing was reusable, so every team rebuilt the same things slightly differently — and the brand paid for it.",
					"I wanted one source of truth that designers and engineers could share, without a meeting to settle every margin.",
				],
			},
			{
				heading: "The system",
				body: [
					"I started with tokens — color, type, spacing, motion — as the contract everything else references. Components came next: thin, opinionated, and deliberately boring, so teams reach for them instead of rolling their own.",
					"To distribute it, I set up a private registry, so any app installs Blueprint like any other dependency. The docs live next to the code with live examples, so the system explains itself and stays honest as it grows.",
					"For AI: a Claude skill handles the rest. It walks agents through installation — including prompting for the private registry credentials — then explains how components should be used in a front-end context and when to pull a component's LLM doc page for full API details before reaching for it. The skill triggers on a slash command or fires automatically whenever someone mentions a component or starts describing a UI feature.",
				],
				figureLayout: "grid",
				figures: [
					{
						src: "/work/blueprint/tokens.svg",
						alt: "Blueprint token scales — color, type, spacing",
						caption: "The token layer — one contract for four apps.",
						width: 800,
						height: 500,
					},
					{
						src: "/work/blueprint/components.svg",
						alt: "Blueprint component library sheet",
						caption: "Every component, all variants.",
						width: 800,
						height: 500,
					},
				],
			},
			{
				heading: "The rollout",
				body: [
					"The real challenge was adoption, not design. Four teams, four codebases, four roadmaps — I couldn't ask them to stop and swap everything at once.",
					"First I built the component library, then designed roughly 170 screens across all four products using it. That gave every team a concrete picture of what Blueprint looked like in their actual UI — easier to buy into than an abstract system.",
					"In 2026, the first phase went live: a theme layer that pushed shared tokens across all four apps in one coordinated release. We kept the visual change deliberately gentle — familiar, just better dressed — so users got consistency without whiplash.",
					"Components are migrating incrementally from there, app by app, as teams touch features. No flag day, no frozen roadmap. It's simply how we build now.",
				],
				figureLayout: "pair",
				figures: [
					{
						src: "/work/blueprint/before.svg",
						alt: "Buildout product UI before Blueprint — inconsistent styles",
						caption: "Before",
						width: 700,
						height: 900,
					},
					{
						src: "/work/blueprint/after.svg",
						alt: "Buildout product UI after Blueprint — unified design language",
						caption: "After",
						width: 700,
						height: 900,
					},
				],
			},
			{
				heading: "The outcome",
				body: [
					"All four products now speak the same language, the component library keeps absorbing the one-offs, and the launch shipped without a single fire — the plan to ease users in held.",
					"The quiet win: design and engineering stopped re-litigating the basics. We argue about the right things now.",
				],
				figureLayout: "stack",
				figures: [
					{
						src: "/work/blueprint/docs.svg",
						alt: "Blueprint docs site — a component page with live examples",
						width: 1600,
						height: 900,
					},
				],
			},
		],
	},
	{
		slug: "tidewater",
		title: "Tidewater banking",
		year: "2024",
		role: "Product design · prototyping",
		summary:
			"A calmer money app. Rebuilt onboarding and the daily home screen around clarity.",
		tags: ["Product", "Fintech", "Motion"],
		intro:
			"Tidewater is a consumer banking app that felt like a spreadsheet wearing a costume. We rebuilt the first-run experience and the home screen around a single idea: show people the one number they actually came to check.",
		facts: [
			{ label: "Role", value: "Product designer" },
			{ label: "Year", value: "2024" },
			{ label: "Scope", value: "Onboarding · home · motion" },
			{ label: "Platform", value: "iOS · Android" },
		],
		sections: [
			{
				heading: "The challenge",
				body: [
					"Onboarding asked for everything up front and explained nothing. Drop-off was steepest on the screen that mattered most.",
				],
			},
			{
				heading: "The approach",
				body: [
					"We sequenced setup so the payoff came early, then deferred the boring-but-necessary steps. Motion did the explaining where copy would have nagged.",
				],
			},
			{
				heading: "The outcome",
				body: [
					"Activation moved meaningfully, and support tickets about “where is my balance” quietly disappeared.",
				],
			},
		],
	},
	{
		slug: "lantern",
		title: "Lantern reader",
		year: "2024",
		role: "Design + build",
		summary:
			"A focused reading app with a warm, paper-like interface and gentle, earned animation.",
		tags: ["Design", "Build", "Typography"],
		intro:
			"Lantern is a reading app I designed and built end to end. The brief I gave myself: make a screen feel like paper at dusk, and never let an animation get in the way of a sentence.",
		facts: [
			{ label: "Role", value: "Designer + developer" },
			{ label: "Year", value: "2024" },
			{ label: "Scope", value: "End-to-end" },
			{ label: "Stack", value: "React · Canvas" },
		],
		sections: [
			{
				heading: "The challenge",
				body: [
					"Reading apps love to interrupt. I wanted the opposite: software that disappears once you start a paragraph.",
				],
			},
			{
				heading: "The approach",
				body: [
					"Type came first: measure, rhythm, and a warm palette tuned for long sessions. Every interaction had to earn its motion or get cut.",
				],
			},
			{
				heading: "The outcome",
				body: [
					"A small, devoted user base and the nicest thing anyone's said about my work: “I forgot I was using an app.”",
				],
			},
		],
	},
	{
		slug: "aurora",
		title: "Aurora analytics",
		year: "2023",
		role: "Design engineering · data viz",
		summary:
			"A dashboard that makes a wall of metrics feel like a view, not a spreadsheet.",
		tags: ["Data viz", "React", "Design systems"],
		intro:
			"Aurora is an analytics surface for an internal data platform. The goal was to turn an intimidating wall of numbers into something you could read at a glance and trust at depth.",
		facts: [
			{ label: "Role", value: "Design engineer" },
			{ label: "Year", value: "2023" },
			{ label: "Scope", value: "Charts · layout · theming" },
			{ label: "Stack", value: "React · D3" },
		],
		sections: [
			{
				heading: "The challenge",
				body: [
					"Power users wanted everything; everyone else wanted the answer. The old dashboard served the first group and lost the second.",
				],
			},
			{
				heading: "The approach",
				body: [
					"Progressive disclosure, a restrained chart vocabulary, and a theming layer so the same components read cleanly in light and dark.",
				],
			},
			{
				heading: "The outcome",
				body: [
					"Time-to-answer dropped, and the dashboard stopped being the thing people screenshotted to ask what it meant.",
				],
			},
		],
	},
];

export function getProject(slug: string): Project | undefined {
	return projects.find((p) => p.slug === slug);
}
