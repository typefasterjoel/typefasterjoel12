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
  /** eyebrow, e.g. "built for agents" */
  eyebrow: string;
  heading: string;
  body: string;
  links?: CaseLink[];
};

/** A punchy hero stat, distinct from the sidebar facts. */
export type CaseStat = { value: string; label: string };

/**
 * Promotes a project into the home hero's featured band. At most one project
 * should carry this. `hook` is the single sentence that has to earn a hiring
 * manager's attention before they scroll — the stats below it do the
 * answering, so the hook only has to state the problem.
 */
export type CaseFeature = {
  hook: string;
  figure: CaseFigure;
};

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
  /** promotes this project into the home hero's featured band */
  featured?: CaseFeature;
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
      "Before Blueprint there was V2 — a design system meant to unify Buildout's products. It powered Prospect and stalled everywhere else. The gap between where the platform was and where V2 needed it to be was just too wide. So I took everything that failure taught me and started over, this time with an actual plan for shipping it.",
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
        href: "https://buildoutinc.github.io/blueprint",
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
    // The hero band. The hook is lifted from "The problem" below rather than
    // written fresh — it is the best sentence in the case study, and the
    // stats beside it are the answer, so the hook only states the problem.
    // The figure is the pipeline screen, not the mascot cover: cover.webp is
    // a saturated cobalt slab that fights the hour-derived palette, and the
    // pipeline's coloured status bands stay legible at aperture scale where
    // a denser screen turns to grey.
    featured: {
      hook: "Four teams, four codebases, four products that looked like they came from four different companies.",
      figure: {
        src: "/work/blueprint/mc-pipeline-after.png",
        alt: "Manage & Close deal pipeline rebuilt in Blueprint — a value strip across the top and a deal table banded by pipeline status",
        width: 1440,
        height: 1024,
      },
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
      eyebrow: "built for humans and machines",
      heading: "A Claude skill ships with the system",
      body: "Blueprint ships a Claude skill alongside the component library. Invoke it with /blueprint, mention a component, or describe a front-end task and it activates on its own. It looks up what's available, dispatches a sub-agent to pull the full component API, and makes sure whatever gets built actually uses Blueprint — not a copy-paste from somewhere else. The system doesn't wait to be rediscovered in a docs tab. It shows up where the work is happening.",
    },
    sections: [
      {
        heading: "The problem",
        body: [
          "Buildout had four products — Manage and Close, Showcase, Prospect, and the CRM — and each one had quietly invented its own idea of what a button should look like. Different colors, different heading sizes, different type scales from product to product. Every time a designer needed a color that didn't exist yet, they just added one.",
          "None of that was anyone being careless. It's just what happens. Four teams, four codebases, four reasonable decisions made in isolation — and the sum of all those good decisions was four products that looked like they'd come from four different companies.",
        ],
      },
      {
        heading: "What V2 taught",
        body: [
          "V2 was the first attempt. It was built on Bootstrap 5.3 while the main platform was still on Bootstrap 3, and that gap turned out to be the whole problem. Something as simple as a new body font size would cascade into broken layouts across dozens of pages. We tried allocating 10% of the week to slowly converting pages over, but it was never going to be a clean swap. The foundations were too different.",
          "What V2 taught me was that you can't design a system without also designing the migration. The components are the easy part. Getting four teams to adopt them without stopping their roadmaps — that's the real job.",
        ],
      },
      {
        heading: "The system",
        body: [
          "Blueprint ships as three packages. Tokens come first — a JSON file synced directly from Figma that generates the SCSS and CSS variables everything else builds on. The theme package is a custom Bootstrap 5.3 that consumes those tokens. The React component library sits on top of that. Change a token in Figma, and it flows through to the theme and into every component.",
          "To keep adoption honest, Blueprint ships a lint rule alongside the components. When a developer reaches for a button or input from another UI library, the rule flags it and points to the Blueprint equivalent. No relying on developers to remember — the tooling does that for them.",
          "For AI-assisted development, there's a Claude skill. Invoke it with /blueprint, or just mention a component or front-end task in conversation and it activates on its own. It looks up the available components, then dispatches a sub-agent to fetch the full API for whichever one is needed before writing a single line of code.",
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
          "Prospect was the first product converted to Blueprint. That made sense — it was the most modern codebase we had, and it's where the early thinking behind Blueprint first took shape. It was also the real test. If Blueprint was as easy to adopt as it needed to be, Prospect would show it.",
          "It was. The swap was clean. No cascading layout breaks, no weeks of one-off fixes. That's the moment Blueprint stopped being a proposal and became the plan for everything else.",
        ],
      },
      {
        heading: "The rollout",
        body: [
          "With Prospect as proof, the rollout to the other three products could happen with confidence. The strategy was the one V2 never got to use: start with the theme layer, push the tokens across all four apps in a single coordinated release, and keep the visual change gentle enough that users would notice the consistency without noticing the change.",
          "That went live in 2026. Components migrate incrementally from there, app by app, as teams touch features. No flag day, no frozen roadmap — a lint rule quietly keeps everyone honest in the meantime.",
          "Look back at the deal pipeline from the top of this case study. That's the clearest measure of how far the migration's come.",
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
    links: [
      {
        label: "AI Contact Search case study",
        href: "/work/prospect-ai-search",
        note: "the full story behind AI Contact Lookup",
        kind: "site",
      },
    ],
    cover: {
      src: "/work/prospect/cover.webp",
      alt: "",
    },
    callout: {
      eyebrow: "no more tab archaeology",
      heading: "The AI does the research so brokers can focus on the call",
      body: "Finding the real owner of a commercial property used to mean hours across public records, LLC databases, and search engines, with no guarantee the contact at the end was right. AI Contact Lookup replaced that with a single step. The agent searches, aggregates, matches against our records, and returns a ranked recommendation with every source attached. Brokers get the confidence to make the call and the receipts to back it up.",
    },
    galleryAfterSection: 2,
    gallery: [
      {
        src: "/work/prospect/search.webp",
        alt: "Prospect property search screen — filterable list with algorithm confidence badges",
        caption: "Property search",
      },
      {
        src: "/work/prospect/owner-unlock.webp",
        alt: "Property ownership tab before AI Contact Lookup runs — owner name and address visible, contacts locked behind a credit",
        caption: "AI Contact Lookup — before",
      },
      {
        src: "/work/prospect/owner-unlocked.webp",
        alt: "Property ownership tab after AI Contact Lookup — legal entity and two AI-verified contacts with phone and email surfaced",
        caption: "AI Contact Lookup — after",
      },
      {
        src: "/work/prospect/owner-phones.webp",
        alt: "Full contact list for a property owner — 24 contacts with AI-verified badges, phone numbers, and email addresses",
        caption: "Verified owner contacts",
      },
      {
        src: "/work/prospect/activity-console.webp",
        alt: "The Console — property and contact details alongside a call-logging panel with tasks assigned to teammates",
        caption: "The Console",
      },
    ],
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
        figureLayout: "pair",
        figures: [
          {
            src: "/work/prospect/prospectnow-old.webp",
            alt: "Old ProspectNow property search screen, pre-acquisition",
            caption: "ProspectNow",
            width: 1440,
            height: 1024,
          },
          {
            src: "/work/prospect/search.webp",
            alt: "Prospect property search screen — filterable list with algorithm confidence badges",
            caption: "Prospect",
            width: 1440,
            height: 1024,
          },
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
  // ── Prospect: AI Contact Search ───────────────────────────────────────
  {
    slug: "prospect-ai-search",
    title: "AI Contact Search",
    year: "2025",
    role: "Product designer · user research",
    summary:
      "Brokers were re-verifying our owner data by hand. I watched how they did it, and we taught an AI agent to do the same thing.",
    tags: ["Product design", "AI", "UX research", "PropTech"],
    intro:
      "Our vendor data was good, but good isn't verified, and a broker about to cold-call an owner needs verified. So brokers double-checked everything by hand. We didn't add another data source. We automated the habit brokers already had.",
    stats: [
      { value: "~2–3K", label: "AI lookups per 30 days" },
      { value: "70–100", label: "Quick Lookups per 30 days" },
      { value: "1", label: "credit per lookup" },
    ],
    facts: [
      { label: "Role", value: "Product designer · user research" },
      { label: "Year", value: "2025" },
      { label: "Timeline", value: "Sept – Nov 2025" },
      {
        label: "Scope",
        value: "Research · AI interaction design · trust patterns · adoption",
      },
      { label: "Company", value: "Buildout · Prospect team" },
    ],
    links: [
      {
        label: "Part of Prospect",
        href: "/work/prospect",
        note: "the product this feature lives in",
        kind: "site",
      },
    ],
    cover: {
      src: "/work/prospect-ai-search/contact-ai-search-cover.webp",
      alt: "AI Contact Search by Prospect — title card on a blue gradient with the Prospect logo",
      width: 1920,
      height: 1080,
    },
    galleryAfterSection: 3,
    gallery: [
      {
        src: "/work/prospect-ai-search/contact-ai-prompt.webp",
        alt: "Property ownership tab with two options: Quick Lookup and In-Depth Owner Lookup, which uses AI and takes longer",
        caption: "Two ways in",
        width: 1460,
        height: 1080,
      },
      {
        src: "/work/prospect-ai-search/contact-ai-searching.webp",
        alt: "The lookup in progress — a short status line reading 'Researching… Searching the web for owner contact information'",
        caption: "The lookup, in progress",
        width: 1460,
        height: 1080,
      },
      {
        src: "/work/prospect-ai-search/contact-ai-results.webp",
        alt: "Lookup results — a related company with an AI research summary, and highest-confidence contacts marked AI Verified, Assessor Match or Legal Entity Officer",
        caption: "Results, ranked by confidence",
        width: 1460,
        height: 1080,
      },
      {
        src: "/work/prospect-ai-search/contact-ai-results-evidence.webp",
        alt: "An AI Research popup open over a contact, listing the source links the agent found, with a note that AI can make mistakes and results should be reviewed",
        caption: "The receipts, on hover",
        width: 1460,
        height: 1080,
      },
    ],
    sections: [
      {
        heading: "Good data isn't verified data",
        body: [
          "We had solid data partners. They still got things wrong sometimes, and a wrong owner means a wasted call or a burned relationship. So brokers did what brokers do: opened a pile of tabs. The company's website, public records, news articles. They were validating our data by hand, every time.",
          "The obvious fix was another data source. I didn't think that was the problem. The brokers had already figured out how to verify an owner. We just weren't in that flow.",
        ],
      },
      {
        heading: "I watched them work",
        body: [
          "I spent the research phase watching brokers do the job. Where do they look first? What makes them believe a contact? What makes them stop trusting one?",
          "Brokers are hard to get ahold of. They're on the phone, in the field, or both. We landed about five interviews, and I took every one of them. Five is small. But they described the same loop, almost step for step.",
          "That flow became the prompt. The agent searches the web the way a broker would, then compares what it finds against our vendor data and property records. Matches get ranked by how much evidence backs them up.",
          "The research didn't inform the feature. It was the feature.",
        ],
      },
      {
        heading: "Two buttons, on purpose",
        body: [
          "We shipped In-Depth Owner Lookup next to the existing Quick Lookup, and we left both there for months. Some brokers already knew who the owner was and only needed a confirmation. Others wanted to see if the AI would do better. I didn't want to force the answer. I wanted to watch it.",
          "Both cost one credit, whether or not the search finds anyone. We pay for the lookup either way, so a refund-on-empty model wasn't on the table.",
          "The waiting state is quiet on purpose. The agent finishes fast, so a progress theatre of steps and spinners would have taken longer than the work. The status text changes as the lookup moves along, with a small animation. That's it.",
        ],
      },
      {
        heading: "Trust is receipts",
        body: [
          "A broker is going to pick up the phone based on this screen. \"The AI said so\" isn't good enough.",
          "So we compare everything the agent finds against vendor data and property records. When a contact matches legal documents or assessor records, it earns a badge (AI Verified, Assessor Match, Legal Entity Officer) and floats into Highest Confidence. The evidence is the ranking.",
          "The AI summary and the contacts show their sources on hover, so a broker can see exactly which links the agent found. The agent didn't search once and grab the first thing it saw. It checked several places, and the broker can see every one.",
          "The popup also says, right at the bottom: \"AI can make mistakes. Please review the information provided below thoroughly.\" I wanted that there. A tool that admits it can be wrong gets trusted more than one that doesn't.",
        ],
      },
      {
        heading: "Watching clicks instead of asking",
        body: [
          "Early on, brokers were hesitant, and they weren't going to tell us why. I'd planned on thumbs up and down to measure quality. Nobody clicked them.",
          "So I stopped asking and started watching. In Pendo I tracked clicks per account. If someone tried the AI lookup and then went back to Quick Lookup, that was the answer: the prompt wasn't good enough yet. We tuned it with about 20 users at a time, a couple of rounds, until the trend flipped.",
          "It flipped hard. Quick Lookup was getting about 70–100 clicks every 30 days. The AI button was getting around 2–3 thousand. In January 2026, we took Quick Lookup out.",
        ],
      },
      {
        heading: "What I got wrong",
        body: [
          "I assumed people would rate the results. They didn't. I should have planned a short survey for after the feature had been used for a while.",
          "That said, the usage data got us to the same conclusion a survey would have. People vote with their clicks.",
          "Next time I'd still build the survey. I just wouldn't wait on it.",
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
