# Blueprint case-study assets

Drop image exports here. They're served from the web root, so a file named
`tokens.png` is referenced in `src/data/projects.ts` as `/work/blueprint/tokens.png`.

Wire them up in the `blueprint` project object (`src/data/projects.ts`):

- **Cover** (replaces the gradient placeholder):
  `cover: { src: "/work/blueprint/cover.png", alt: "…", width: 1600, height: 900 }`
- **Per-section figures** (e.g. on "The system"):
  `figures: [{ src: "/work/blueprint/tokens.png", alt: "…", caption: "…", width: 1600, height: 900 }]`

Notes:
- `alt` is required; `caption` is optional.
- Always pass `width`/`height` to reserve space and avoid layout shift.
- Prefer optimized `.webp`/`.png`. Images render at 16:9 (object-fit: cover).

Suggested shots: a lead `cover`, token scales / type ramp / component overview
and light-dark theme (Figma exports), plus live doc-site captures including the
LLM/AI pages.
