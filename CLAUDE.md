# typefasterjoel — portfolio

Joel's personal portfolio site. The goal is awwwards-tier: a site that wows hiring managers and clients for design and design engineering roles.

## Tech stack

- **Framework**: TanStack Router (file-based, SSR-capable), React 19, Vite, Bun
- **Language**: TypeScript throughout
- **Animation**: GSAP (scroll reveals, transitions) + one raw WebGL2 fragment shader for the sky (no Three.js)
- **Styling**: Plain CSS custom properties — no Tailwind, no CSS-in-JS
- **Content**: All project data lives in `src/data/projects.ts` — no CMS

## Creative direction — "The Hour You Arrive"

**The sky is the hour you arrived. The ground is where you walk.**

The site renders in the visitor's real local time. Someone who visits at 6am and
someone who visits at 11pm walk the same path in different light. The sky is
fixed for the visit — it never responds to scroll or pointer. What moves is the
visitor, along the ground, through the five journey beats, under that one sky.

**Five felt beats:** arrival → the path → points of interest → the traveler →
the send-off.

**There is no fixed accent colour.** `--accent` IS the light source: white-gold
at noon, amber at dusk, moon-silver at night. Its hue and chroma come from the
sun; its luminance is solved at runtime to clear 4.5:1 against the current
ground. Never introduce a hardcoded colour — every colour is derived in
`src/lib/sky-palette.ts` and written to `:root` by `src/lib/sky-time.tsx`.

**Locked out:** literal cloud rendering of any kind; scroll- or pointer-linked
motion on any sky element; a HUD, clock readout, chapter marker, or map; a
sunburst on the moon; custom cursor companion; ambient sound.

## The sky and the ground

Two planes. `.sky-root` is fixed behind the whole document and never moves.
`.ground` is the opaque surface that begins where the hero ends and scrolls up
over the sky — its top edge is the horizon. The hero sits in the sky; everything
after it is on the ground. Routes without a hero are ground from their first
pixel.

One WebGL2 fragment shader on one full-screen triangle draws the gradient, the
sun or moon, its rays, the stars and the motes — `src/lib/sky-field.ts` and
`src/lib/sky-shader.ts`. No Three.js: nothing here is 3D, so a 3D library cost
~510KB for nothing. The CSS gradient on `.sky-root` is the no-WebGL fallback and
the pre-hydration paint.

The shader **decides nothing.** Sun position, ray strength and star opacity are
computed and unit-tested in `sky-palette.ts` and arrive as uniforms. Keep it
that way: physics in TypeScript, drawing in GLSL. `sky-field.ts` sets every
uniform the shader might use; adding a sky layer means adding GLSL only.

**Ray intensity scales inversely with sun altitude** — light travelling through
more atmosphere scatters more, which is why dawn and dusk get shafts and midday
does not. The effect limits itself, which is the difference between atmosphere
and decoration.

## Design tokens

Everything derives from one variable: the time of day. `solar-clock.ts` →
`sky-stops.ts` → `sky-palette.ts` → CSS custom properties on `:root`. Both the
shader and the CSS fallback read those same properties, so they cannot drift.

There are no per-theme blocks and no `[data-theme]` selectors. Surfaces,
borders and ink steps are OKLCH luminance offsets from the ground, so one rule
covers both the day and night ground states.

**Contrast floors, enforced by test across all 1,440 minutes of the day:**
`--accent` ≥ 4.5:1 on `--ground`, `--accent-strong` ≥ 3.0:1, `--ink` ≥ 7.0:1.
Never lower a floor to make a colour work — change the colour.

**Type:** Newsreader (display, variable `opsz` 6–72 + `wght` 200–800) and
Instrument Sans (body), both from Fontsource. The display face's optical size and
weight are driven by sky luminance, because thin strokes genuinely disappear in
low light.

Three things to know before touching the fonts: the CSS family names carry a
**`Variable` suffix** (`"Newsreader Variable"`); `src/styles/fonts.css` imports the
**axis-specific** entry points (`newsreader/opsz.css`), because the packages'
default `index.css` ships a reduced axis set; and **italic is a separate import**
(`opsz-italic.css`), which the section markers need. A missing axis fails
*silently* — the browser ignores it and `wght` keeps working — so verify in a
browser, never by inspection.

Space Mono is kept for exactly one purpose: **real code.** It is never a label,
never an eyebrow, and never carries a leading `//`.

**Voice:** when drafting or revising case study copy, read
`design_handoff/voice-guide.md` first.

## Case studies

Project data: `src/data/projects.ts` — single source of truth for all case study content (copy, stats, figures, links). The project page component is `src/routes/work/$slug.tsx`.

Figure layouts supported on `CaseSection`:
- `"stack"` — full-width, one at a time (default)
- `"pair"` — 50/50 side-by-side (before/after)
- `"grid"` — responsive 2–3 col (component sheets, token scales)

Placeholder images live in `public/work/[slug]/` as SVGs until real exports are ready.

**Voice**: when drafting or revising case study copy, read `design_handoff/voice-guide.md` first — it's a reference built from Joel's own writing (blunt opinions, concrete metaphors over abstractions, short punchy closers, no corporate softeners) so drafts sound like him, not generic AI copy.

## Running locally

```bash
bun dev        # dev server at localhost:3000
bun run build  # production build
```

## What to always keep in mind

- Wonder comes from restraint. If an effect has to be explained, it's too much.
- The site is a journey, not a showcase. Pacing matters as much as polish.
- Structural devices must encode something true. Case studies are not a
  sequence, which is why they carry a year and not an index.
- Hiring managers for design/design engineering roles are the primary audience.
