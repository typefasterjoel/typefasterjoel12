# Side quests

## Problem

The portfolio's `/work` only holds full case studies (`Project` in `src/data/projects.ts`) — a multi-section narrative template with stats, sections, figures, gallery, and callout. Some things worth showing don't fit that shape: a hackathon project (a TUI that scaffolds a new prototype repo with Bun, Blueprint, and a Claude skill pre-wired so a user can start prompting immediately) and Yumu (a small desktop app adding features to YouTube Music) are both real, worth surfacing, but too small to justify the full case-study template. Forcing them into `Project` means either padding out sections that don't have real content, or leaving them as permanent drafts that never ship.

"Side quests" is a lighter, recurring category for this kind of work: smaller experiments and side projects, shown as compact cards rather than full pages, that a visitor can peek into without leaving the page they're on.

## Scope

- New data shape and content for side quests (`Yumu`, hackathon TUI project).
- New card + modal components to display them.
- Two integration points: a subsection on `/work` index, and a small teaser row on the homepage's `Work` beat.
- Migrating Yumu out of `projects.ts` into the new shape.

Out of scope: individual `/work/$slug`-style pages for side quests (explicitly rejected — see Approach below), changes to the full case-study template, changes to Gamer's Hive TV (remains a full case-study draft).

## Data model

New file `src/data/side-quests.ts`, separate from `Project`:

```ts
import type { CaseFigure, CaseLink } from "#/data/projects";

export type SideQuest = {
  slug: string;
  title: string;
  /** 1-3 sentences — shown (truncated) on the card and in full in the modal */
  blurb: string;
  tags?: string[];
  year?: string;
  /** reuse CaseFigure — src/alt/width/height, same as case-study figures */
  thumbnail: CaseFigure;
  /** repo/demo/etc — reuse CaseLink so the icon-by-kind logic is shared */
  links: CaseLink[];
  /** same gating convention as Project — hidden everywhere until real content lands */
  draft?: boolean;
};

const allSideQuests: SideQuest[] = [
  // ...
];

/** Published side quests only — drafts never reach the UI. */
export const sideQuests: SideQuest[] = allSideQuests.filter((q) => !q.draft);
```

`CaseFigure` and `CaseLink` are already exported from `projects.ts` — reusing them avoids a parallel type for what is structurally the same data, and keeps `SideQuestCard`/`SideQuestModal` able to reuse any shared figure/link-icon rendering logic that already exists for case studies.

`SideQuest` deliberately does **not** include `sections`, `stats`, `facts`, `gallery`, `callout`, or `cover` — those are case-study-only concepts. If a side quest ever needs more depth than this shape allows, that's the signal it should graduate to a full `Project` instead (as Blueprint could conceivably absorb related side projects later, but that's not this project).

## Components

Two new components, kept separate from the case-study rendering path in `work/$slug.tsx`:

**`SideQuestCard.tsx`**
- Renders thumbnail, title, truncated blurb, tags.
- Used in two places: the homepage mini row and the `/work` index section — same component, no variant prop needed beyond CSS context (parent controls layout via a wrapper class, same pattern as `work-grid` vs `work-list` today).
- On click, captures its own `getBoundingClientRect()` and calls an `onOpen(quest, rect)` passed down from whichever page is hosting it.

**`SideQuestModal.tsx`**
- Portal-rendered to `document.body`, same dialog/focus-trap/scroll-lock scaffolding as `ImageModal.tsx` (reuse that logic rather than reinventing focus management).
- Difference from `ImageModal`: animates in via GSAP, tweening from the origin card's captured rect to a centered, larger stage — a FLIP-style scale/position transition — rather than `ImageModal`'s fixed centered fade-in.
- Content: enlarged thumbnail, full blurb, tags, link(s) out (reusing the same icon-by-`kind` rendering already used for `CaseLink` elsewhere).
- `prefers-reduced-motion`: skip the tween, show/hide instantly — same handling `Atmosphere.tsx` already applies for motion-sensitive users.

State ownership: each hosting page (`work/index.tsx`, `Work.tsx`) keeps its own local `{ openQuest, originRect }` state and renders one `SideQuestModal` conditionally. No global store — only one side-quest modal can be open at a time per page, and the two hosts never render simultaneously in the same tree.

## Integration points

**`/work` index (`src/routes/work/index.tsx`)**
- Main `work-grid` of full case studies is unchanged.
- Below it, a new "Side quests" heading + a lighter card row rendering `sideQuests.map(...)` via `SideQuestCard`.

**Homepage `Work.tsx` (points-of-interest beat)**
- Below the existing `work-list`, a small row of 2-3 `SideQuestCard`s (same component, compact layout) teases the category, encouraging a visit to `/work` for the full set.
- This does not add a new felt beat — it's nested inside the existing "points of interest" beat, keeping the five-beat journey structure intact.

## Content migration

- Yumu's current entry in `projects.ts` (`draft: true`, all `TODO(joel)` placeholders) is removed from `allProjects` and re-created as a `draft: true` stub in `side-quests.ts`. No real content exists yet either way, so nothing is lost.
- The hackathon TUI project is added as a second `draft: true` stub in `side-quests.ts`, following the same `TODO(joel)` placeholder convention already used for Yumu/Gamer's Hive TV, for Joel to fill in later (name, blurb, screenshot, repo link).
- Gamer's Hive TV is untouched — remains a full case-study draft in `projects.ts`.

## Accessibility & motion

- `SideQuestModal` reuses `ImageModal`'s dialog semantics: `role="dialog"`, `aria-modal`, focus trap, focus restore on close, `Escape` to close, body scroll lock while open.
- The zoom-in/out tween is purely decorative motion layered on top of that — it must never gate when content becomes focusable/visible; reduced-motion users get the same end state instantly.

## Approaches considered

1. **Reuse `Project` + a `kind` flag** — rejected: `Project` carries stats/sections/gallery/callout fields that would sit permanently unused on quest entries, and the index/homepage rendering would need branching logic to skip all of that.
2. **New top-level `/side-quests` route** — rejected: makes side quests a fifth destination rather than a lighter layer within the existing "points of interest" beat; adds a nav entry for content that's explicitly meant to read as lower-stakes than the flagship case studies.
3. **Chosen: separate `SideQuest` type, no dedicated page, zoom-in modal, subsection of `/work` + homepage teaser** — smallest data shape for the content that exists, no wasted fields, no new route/nav entry, and the modal gives enough space to show a screenshot + blurb + links without the overhead of a full page per entry.
