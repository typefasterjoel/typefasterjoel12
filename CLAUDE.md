# typefasterjoel — portfolio

Joel's personal portfolio site. The goal is awwwards-tier: a site that wows hiring managers and clients for design and design engineering roles.

## Tech stack

- **Framework**: TanStack Router (file-based, SSR-capable), React 19, Vite, Bun
- **Language**: TypeScript throughout
- **Animation**: GSAP (scroll reveals, transitions) + Three.js (WebGL atmosphere, desktop only)
- **Styling**: Plain CSS custom properties — no Tailwind, no CSS-in-JS
- **Content**: All project data lives in `src/data/projects.ts` — no CMS

## Creative direction — "Golden Hour"

The site is inspired by the *feeling* of Breath of the Wild / Tears of the Kingdom: open, serene, a quiet sense of wonder. **It is not a gaming aesthetic.** No Triforce, no HUD, no pixel art, no RPG UI. The Zelda reference is purely emotional — wind, light, space, pacing.

The gold accent (`--gold-*` tokens) reads as golden-hour light, not decoration. The site is a short journey, not a portfolio grid.

**Five felt beats** (the journey structure):
1. **Arrival** — preloader → hero crest
2. **The path** — intro / who Joel is
3. **Points of interest** — work / case studies
4. **The traveler** — about
5. **The send-off** — contact

**What creates wonder here:** light, space, restraint, and motion that earns itself. Every animation should feel like the world breathing, not a UI framework showing off.

**Locked out:** custom cursor companion, ambient sound, any HUD/chapter/map UI that makes the gaming reference literal.

## Atmosphere (Phase 2 — complete)

WebGL drifting gold motes via Three.js. Lives in `src/lib/atmosphere-field.ts` (shader-driven point field, theme-reactive, pointer/scroll parallax, tab-blur pause). Lazy-loaded by `src/components/Atmosphere.tsx` only on capable desktops (`pointer: fine`, ≥820px, not `prefers-reduced-motion`). Mobile and reduced-motion get a CSS `.atmosphere` fallback — Three.js (~510 KB) never ships to them.

**Still pending:** time-of-day theming refinement (smoother auto day↔dusk + optional tint).

## Case studies

Project data: `src/data/projects.ts` — single source of truth for all case study content (copy, stats, figures, links). The project page component is `src/routes/work/$slug.tsx`.

Figure layouts supported on `CaseSection`:
- `"stack"` — full-width, one at a time (default)
- `"pair"` — 50/50 side-by-side (before/after)
- `"grid"` — responsive 2–3 col (component sheets, token scales)

Placeholder images live in `public/work/[slug]/` as SVGs until real exports are ready.

## Design tokens

Single gold accent, editorial type scale (Space Grotesk + Space Mono), light "studio" + dark "terminal" themes. Everything via CSS custom properties — no hardcoded colors in components.

## Running locally

```bash
bun dev        # dev server at localhost:3000
bun run build  # production build
```

## What to always keep in mind

- Wonder comes from restraint. If an effect has to be explained, it's too much.
- The site is a journey, not a showcase. Pacing matters as much as polish.
- "Gaming inspired" means the *feeling*, never the aesthetic. Keep it editorial and timeless.
- Hiring managers for design/design engineering roles are the primary audience.
