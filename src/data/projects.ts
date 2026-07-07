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

/** Small context grid shown just before the gallery carousel — e.g. legacy
 * screens contrasted against the system that replaced them. Kept deliberately
 * quiet so it reads as an aside, not a second before/after reveal. */
export type CaseGalleryIntro = {
  caption?: string;
  figures: CaseFigure[];
};

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
  /** small context grid rendered just before the gallery carousel, same section anchor */
  galleryIntro?: CaseGalleryIntro;
  /** drafts are hidden everywhere (work list, /work index, direct URL) until real content lands */
  draft?: boolean;
};

/**
 * Voice follows the design system: sentence case, friendly, concise, lightly
 * playful. Draft entries stay `draft: true` until their questionnaire in
 * design_handoff/project-content-questionnaire.md is answered.
 */
const allProjects: Project[] = [
  // ── Blueprint ──────────────────────────────────────────────────────────
  // TODO(joel): confirm the values flagged `TODO` below before publishing —
  // real numbers only. Drop visuals into /public/work/blueprint/ and wire
  // up `cover` + per-section `figures` (see the commented stubs).
  {
    slug: "blueprint",
    title: "Blueprint",
    year: "2025 – present",
    role: "Senior design engineer · creator",
    summary:
      "One design language for four Buildout products: tokens, components, docs, a private registry, and pages built for AI agents.",
    tags: ["Design systems", "React", "Tokens", "AI tooling"],
    intro:
      "Before Blueprint there was V2. A design system built to unify Buildout's products that powered Prospect but never made it across the finish line. The tech gap between where the platform was and where V2 needed it to be was too wide. So I took everything that attempt taught me and started over, this time with a plan for how to actually ship it.",
    stats: [
      { value: "4", label: "products, one language" },
      { value: "68", label: "components shipped" },
      { value: "170+", label: "screens designed" },
    ],
    facts: [
      { label: "Role", value: "Creator · senior design engineer" },
      { label: "Year", value: "2025 – present" },
      {
        label: "Scope",
        value: "Tokens · components · theme · docs · registry · Claude skill",
      },
      {
        label: "Stack",
        value: "React · TypeScript · tokens · private npm registry",
      },
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
    ],
    cover: {
      src: "/work/blueprint/cover.webp",
      alt: "Blueprint mascot — an otter in a hard hat, alongside the Blueprint wordmark",
      width: 1920,
      height: 1080,
    },
    galleryAfterSection: 2,
    galleryIntro: {
      caption: "Two products, two eras, neither speaking the same language.",
      figures: [
        {
          src: "/work/blueprint/legacy.png",
          alt: "Legacy Buildout CRM deal pipeline — dark navy header, dense data table, pre-V2",
          caption: "Legacy",
          width: 1440,
          height: 1024,
        },
        {
          src: "/work/blueprint/v2.png",
          alt: "V2 attempt — property search screen with map, filters, and listing cards",
          caption: "V2",
          width: 1440,
          height: 1024,
        },
      ],
    },
    gallery: [
      {
        src: "/work/blueprint/crm-after.png",
        alt: "CRM property detail page in Blueprint — AI summary, contacts, and deals in pipeline",
        caption: "CRM — property detail",
      },
      {
        src: "/work/blueprint/mc-pipeline-after.png",
        alt: "Manage & Close deal pipeline in Blueprint — status bands and data table",
        caption: "Manage & Close — deal pipeline",
      },
      {
        src: "/work/blueprint/prospect-after.png",
        alt: "Prospect property search in Blueprint — filterable list alongside a map view",
        caption: "Prospect — property search",
      },
      {
        src: "/work/blueprint/showcase-after.png",
        alt: "Showcase listings grid in Blueprint — property cards with status and location",
        caption: "Showcase — listings",
      },
    ],
    callout: {
      eyebrow: "// built for humans and machines",
      heading: "A Claude skill ships with the system",
      body: "Blueprint ships a Claude skill alongside the component library. Invoke it with /blueprint, mention a component, or describe a front-end task and it activates on its own. It looks up what is available, dispatches a sub-agent to pull the full component API, and makes sure whatever gets built is using Blueprint correctly. The system does not wait to be rediscovered in a docs tab. It shows up where the work is happening.",
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
        heading: "The problem",
        body: [
          "Buildout had four products: Manage and Close, Showcase, Prospect, and the CRM. Each had grown its own idea of what the UI should look like. Buttons had different colors across apps. Heading sizes and page typography were inconsistent from product to product. Custom colors kept getting added whenever a designer needed something that didn't exist in the system they were working in.",
          "Nothing was intentionally broken. It just grew that way. Four teams, four codebases, four reasonable decisions made in isolation that added up to four products that looked like they came from different companies.",
        ],
      },
      {
        heading: "What V2 taught",
        body: [
          "V2 was the first attempt. It was built on Bootstrap 5.3 while the main platform was still on Bootstrap 3, and that gap turned out to be the whole problem. Something as simple as a new body font size would cascade into broken layouts across dozens of pages. We tried allocating 10% of the week to slowly converting pages over, but it was never going to be a clean swap. The foundations were too different.",
          "What V2 taught me was that you cannot design a system without also designing the migration. The components are the easy part. Getting four teams to adopt them without stopping their roadmaps is the real job.",
        ],
      },
      {
        heading: "The system",
        body: [
          "Blueprint ships as three packages. Tokens come first, a JSON file synced directly from Figma that generates the SCSS and CSS variables everything else builds on. The theme package is a custom Bootstrap 5.3 that consumes those tokens. The React component library sits on top of that. Change a token in Figma, and it flows through to the theme and into every component.",
          "To keep adoption honest, Blueprint ships a lint rule alongside the components. When a developer reaches for a button or input from another UI library, the rule flags it and points to the Blueprint equivalent. No relying on developers to remember. The tooling does it for them.",
          "For AI-assisted development, there is a Claude skill. Invoke it with /blueprint or mention a component or front-end task in conversation and it activates automatically. It looks up the available components, then dispatches a sub-agent to fetch the full API for whichever component is needed before writing a single line of code.",
        ],
        figureLayout: "grid",
        figures: [
          {
            src: "/work/blueprint/tokens.png",
            alt: "Blueprint token architecture — a primitive color traced through a semantic alias into a component token and rendered as a button, alongside a 406-token scale breakdown",
            caption: "One value, three layers, four products.",
            width: 1920,
            height: 1080,
          },
          {
            src: "/work/blueprint/lint.png",
            alt: "A code editor showing an ESLint rule catching an import from react-bootstrap, with a hover tooltip pointing to the equivalent Blueprint component",
            caption: "The lint rule does the remembering.",
            width: 1218,
            height: 685,
          },
        ],
      },
      {
        heading: "The proof",
        body: [
          "Prospect was the first product converted to Blueprint. It made sense. It was the most modern codebase we had, and it was where the early thinking that led to Blueprint first took shape. It was also the real test. If Blueprint was as easy to adopt as it needed to be, Prospect would show that.",
          "It was. The swap was clean. No cascading layout breaks, no weeks of one-off fixes. That was the moment Blueprint stopped being a proposal and became the plan for everything else.",
        ],
      },
      {
        heading: "The rollout",
        body: [
          "With Prospect as proof, the rollout to the other three products could happen with confidence. The strategy was the same one V2 never got to use: start with the theme layer. Push the tokens across all four apps in a single coordinated release. Keep the visual change gentle enough that users notice the consistency without noticing the change.",
          "That went live in 2026. Components migrate incrementally from there, app by app, as teams touch features. There is no flag day, no frozen roadmap. A lint rule quietly keeps everyone honest in the meantime.",
          "The deal pipeline from the opening screen is a good measure of how far that migration went.",
        ],
        figureLayout: "pair",
        figures: [
          {
            src: "/work/blueprint/legacy.png",
            alt: "Buildout deal pipeline before Blueprint — dark navy header, dense unstyled table",
            caption: "Before — the same screen from the top of this case study",
            width: 1440,
            height: 1024,
          },
          {
            src: "/work/blueprint/mc-pipeline-after.png",
            alt: "Buildout deal pipeline after Blueprint — sidebar nav, unified tokens, legible data table",
            caption: "After",
            width: 1440,
            height: 1024,
          },
        ],
      },
      {
        heading: "The outcome",
        body: [
          "All four products now speak the same language, the component library keeps absorbing the one-offs, and the launch shipped without a single fire. The plan to ease users in held.",
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
    slug: "prospect",
    title: "Prospect",
    year: "2022 – 2025",
    role: "Product designer",
    summary:
      "A commercial listing marketplace redesigned for brokers. AI contact lookup, predictive algorithm badges, and the seed that grew into Blueprint.",
    tags: ["Product design", "PropTech", "AI", "Design systems"],
    intro:
      "Prospect started as a listing marketplace for investors and ended up as the product that seeded Blueprint and absorbed 400 ProspectNow customers when Buildout made the acquisition. Getting there meant rethinking who the product was actually for, and rebuilding the experience around them.",
    stats: [
      { value: "400", label: "customers migrated" },
      { value: "97%", label: "migration retention" },
      { value: "2022 – 2025", label: "years on product" },
    ],
    facts: [
      { label: "Role", value: "Product designer" },
      { label: "Year", value: "2022 – 2025" },
      {
        label: "Scope",
        value: "UX redesign · AI features · prospecting tools · CRM-lite",
      },
      { label: "Company", value: "Buildout · PropTech" },
    ],
    callout: {
      eyebrow: "// no more tab archaeology",
      heading: "The AI does the research so brokers can focus on the call",
      body: "Finding the real owner of a commercial property used to mean hours across public records, LLC databases, and search engines, with no guarantee the contact at the end was right. AI Contact Lookup replaced that with a single step. The agent searches, aggregates, matches against our records, and returns a ranked recommendation with every source attached. Brokers get the confidence to make the call and the receipts to back it up.",
    },
    sections: [
      {
        heading: "The pivot",
        body: [
          "The platform had good bones. Real data, a familiar structure, something brokers could recognize. The problem was it was built for investors, not brokers, and those two users want completely different things.",
          "Investors browse. Brokers hunt. They need to know which properties are worth a call, who the real owner is, and how to get there before anyone else does. None of that was in the product yet.",
        ],
      },
      {
        heading: "A broker's day, before",
        body: [
          "Before Prospect, finding out if a property was worth pursuing meant opening a lot of tabs. Public records, LLC registrations, county databases, search engines. You might spend an hour tracking down an owner only to find out the contact was wrong or already being worked by someone else.",
          "Smart saved searches didn't exist either. If you set up a search and walked away, you had no way of knowing when something changed. You had to come back and check manually, or miss it.",
        ],
      },
      {
        heading: "What we built",
        body: [
          "We built four things that changed that workflow directly.",
          "The first was Smart Saved Search. Set your filters once and walk away. When new properties match or existing ones get updated in our index, the broker gets notified. No manual checking, no missed windows.",
          "The second was the algorithm badge. Every property gets a confidence tier: Likely, Very Likely, or Extremely Likely to sell or refinance within a year. There is no bad score, just a signal of how strong the data is for that area. It gives brokers a way to prioritize without having to read between the lines.",
          "The third was AI Contact Lookup. Instead of the tab archaeology a broker used to do, our AI agent runs the search, pulls from multiple sources, matches results against our records, and surfaces a ranked recommendation with every source listed. Brokers can verify manually if they want, but most of the time they don't need to.",
          "The fourth was Lists and the Console. Brokers could organize properties into lists and then work through them in the Console, a lightweight workspace for cold calling. Notes, tasks, contact history, all in one place. Not a full CRM, but everything a broker actually needs while they are in the middle of a call.",
        ],
      },
      {
        heading: "The migration",
        body: [
          "When Buildout acquired ProspectNow, 400 customers needed a new home. Prospect was it. Before the migration started, I went through the ProspectNow feature set and identified anything that was missing in Prospect. Mailers was the main one. We got those gaps closed before anyone moved over.",
          "400 customers migrated. 12 churned. The rest stayed and moved to the new plans. A 97% retention rate through an acquisition migration is not something that happens by accident. The product had to be ready, and it was.",
        ],
      },
      {
        heading: "The outcome",
        body: [
          "Prospect ended up being more than a redesigned product. Because we had more freedom to build it the way we wanted, it became a testing ground for what a shared design language across all of Buildout could look like. The patterns we established here, the components, the decisions we kept making the same way across screens, those became the foundation for Blueprint.",
          "It was also the first Buildout product to be converted to Blueprint once the system was ready. In a way, Prospect both inspired it and got to prove it.",
        ],
      },
    ],
  },
  // ── Gamer's Hive TV (draft) ───────────────────────────────────────────
  // TODO(joel): answer design_handoff/project-content-questionnaire.md, then
  // write real copy in the house voice and flip `draft` off. Imagery goes in
  // /public/work/gamers-hive-tv/.
  {
    slug: "gamers-hive-tv",
    title: "Gamer's Hive TV",
    draft: true,
    year: "TODO(joel)",
    role: "TODO(joel)",
    summary: "TODO(joel): one-line summary for the work list.",
    tags: ["TODO(joel)"],
    intro: "TODO(joel): case-study intro — the problem in one breath.",
    facts: [
      { label: "Role", value: "TODO(joel)" },
      { label: "Year", value: "TODO(joel)" },
      { label: "Scope", value: "TODO(joel)" },
      { label: "Stack", value: "TODO(joel)" },
    ],
    sections: [
      { heading: "The problem", body: ["TODO(joel)"] },
      { heading: "The approach", body: ["TODO(joel)"] },
      { heading: "The outcome", body: ["TODO(joel)"] },
    ],
  },
];

/** Published projects only — drafts never reach the UI or the router. */
export const projects: Project[] = allProjects.filter((p) => !p.draft);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
