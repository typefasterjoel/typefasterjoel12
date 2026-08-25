# Browser check — the time-of-day palette

Everything on the site now takes its colour from the visitor's local clock. The
maths is covered by tests: every one of the 1,440 minutes in a day is verified
for text contrast automatically. What tests cannot see is whether it *looks*
right. That is what this checklist is for.

Work through it at a running site (`bun dev`, then <http://localhost:3000>).
It takes about fifteen minutes.

---

## Before you start: how to jump to any hour

Open the browser console (F12 → Console) and paste one line at a time. Each one
reloads the page at that hour.

```js
localStorage.setItem('tfj-hour','6.5'); location.reload();   // sunrise
localStorage.setItem('tfj-hour','13');  location.reload();   // noon
localStorage.setItem('tfj-hour','19.5');location.reload();   // sunset
localStorage.setItem('tfj-hour','1');   location.reload();   // night
```

When you are finished, this is how you get back to the real clock:

```js
localStorage.removeItem('tfj-hour');    location.reload();
```

> **Important.** Clicking the light/dark toggle in the header does the same
> thing as the first set of commands — it pins the site to a fixed hour and
> writes that choice to the browser permanently. There is currently no button
> that undoes it. The `removeItem` line above is the only way back to the real
> clock, and it will stay that way until the time scrubber ships. If you have
> ever clicked that toggle on your own machine, run the `removeItem` line
> before judging anything below, or you will be looking at a frozen hour.

---

## 1. Read the site at four hours

Run each of the four commands above and, at each hour, look for:

- **Headlines and body copy are comfortably readable.** Not "technically legible
  if you lean in" — comfortable.
- **The accent colour is visible but not garish.** It should read as light
  falling on the page.
- **Card and section borders are discernible.** If a card's edge disappears into
  the background at any hour, note the hour.

*What wrong looks like:* text that greys out at one particular hour, or an
accent that vanishes into the background at midday.

## 2. The display typeface at noon versus at night

**This is the check most likely to catch a real bug, and the one thing on this
list that nothing else can confirm.**

The display face is meant to change its *optical size* through the day: airy,
high-contrast letterforms at noon, sturdier and lower-contrast at night. That
depends on the font file shipping an `opsz` axis. We have confirmed the axis
exists in the font package's metadata, but nobody has ever seen it work.

**What to do:** put a large headline on screen — the hero is fine. Screenshot it
at noon (`13`). Screenshot it again at night (`1`). Put the two side by side.

**What you are looking for:** the *letterforms themselves* should differ. Look at
the thin strokes — the hairlines in the curves of an "o" or an "e", the
crossbar. At noon these should be noticeably finer relative to the thick
strokes; at night the difference between thick and thin should be less
dramatic, and the terminals a little blunter.

**What wrong looks like — and this is the trap:** the text at night looks
*heavier*, and that is all. If the only difference is overall weight, the
`opsz` axis is not being applied. Weight is animated by a separate axis that
works regardless, so a missing `opsz` fails completely silently: it looks like
it is working while every headline on the site renders at the wrong optical
size. If in doubt, it is not working — the difference, when it is real, is
obvious in the hairlines.

## 3. No flash of the wrong palette on first paint

Load the site fresh (hard refresh, Ctrl+Shift+R) and watch the very first
moment of the page.

Do this **especially at night** — that is where a mistake is most visible.

*What wrong looks like:* a white or pale flash before the dark palette arrives.
Even one frame counts. Try it a few times; it is intermittent by nature.

## 4. The day↔night change is a fade, not a flash

Set the hour to just before a transition and then just after — sunrise is at
06:00 and sunset at 20:00, so try `5.9` then `6.1`, and `19.9` then `20.1`.

The background switches between its light and dark state **hard**, by design.
It is not crossfaded, and that is deliberate: fading the background smoothly
between the two would park it, mid-fade, in a middle brightness where neither
dark nor light text is readable. So the background changes state in one step,
and a 1.2-second CSS fade is the *entire* thing softening it.

*What wrong looks like:* the change reads as a snap or a strobe rather than a
settle. If it does, that 1.2-second transition is not being applied, and the
fix is in the CSS, not in the colour maths.

## 5. Work-list alignment

Look at the work list on the home page, then at the `/work` page.

- The year column is fixed at 18 characters wide. Check that a long entry like
  **"2025 – present"** actually fits inside it in Instrument Sans without
  wrapping or being clipped.
- Check that the project descriptions all start at the same left edge.
- Check both at a **desktop width and a narrow phone width** — they are
  different layouts and can break independently.

*What wrong looks like:* one row's description sitting a few pixels off from
the others, or a year wrapping to two lines.

## 6. Nav legibility against the sky

Scroll to the top at **every** hour you test and read the navigation.

This is the one place the automatic contrast guarantee does not cover. The tests
verify text against the *ground* — the page background. The nav sits over the
*sky*, which is a different, moving colour, and nothing checks it.

*What wrong looks like:* nav links that wash out at a particular hour —
most likely mid-morning and mid-afternoon, when the sky is at its brightest.
Note the hour if you see it.

---

## Four things we noticed, for your call

These are not bugs — the site works and every contrast floor holds. They are
judgement calls about direction, and they are yours to make.

### 1. The sky colours look washed out

Three separate measurements pointed at the same thing: the sky stops carry very
little colour saturation.

The clearest symptom is at midday. At 13:00 the accent resolves to `#6e6753` —
a muddy olive. That happens because the noon light colour only carries 0.031
chroma (essentially a warm off-white), and once it is darkened enough to be
readable against the pale background, what little colour it had is gone.

For a site whose whole idea is "the accent *is* the sun", noon currently reads
as nothing in particular. Sunrise and sunset fare much better — 19:00 gives
`#975900`, a real amber. It is the middle of the day that falls flat.

**Your call:** whether to push saturation into the sky stops, especially the
noon one.

### 2. The night background's sky tint is invisible

The background is supposed to pick up a faint tint from the current sky colour,
so that 1am and 4am are not identical.

In practice the tint is too subtle to survive being rounded to an 8-bit colour.
Of the 599 minutes the site spends in its night state, **506 render the exact
same `#10131a`** — there are only 9 distinct background colours across the
entire night.

**Your call:** whether the night should visibly drift, or whether one steady
night colour is the right answer.

### 3. The moon casts the sun's shadows

Shadow length is derived from how high the sun sits, but it uses the *distance*
from the horizon rather than the direction — so a sun 40° below the horizon
produces exactly the same shadow as a sun 40° above it.

The result: at midnight, shadows are 10px long. At noon, they are 9px. Night
shadows are, if anything, *harder* than midday's.

**Your call:** whether night should have soft, long, diffuse shadows (moonlight)
or none at all.

### 4. Shadows flip direction instantly at sunrise and sunset

The light angle sweeps smoothly through the day, then reverses in a single step
at each terminator: at 06:00 it goes from +69° to −70°, and at 20:00 from +70°
to −69°.

Those are precisely the moments when shadows are at their longest (48px, the
maximum). So every shadow on the page is at full length and swings from one side
to the other instantaneously.

**Your call:** whether the light should ease through the flip, or whether
shadows should shorten to nothing across the terminator so the reversal is
never seen.

---

## Two small leftovers

- **The browser chrome colour is hardcoded.** The `theme-color` meta tag is
  fixed at `#07080b`, a near-black. On mobile browsers that tint the address bar
  to match the site, this will be wrong for most of the day — the site is pale
  from about 6am to 8pm. It should follow the clock like everything else.

- **The clock ticks every 60 seconds, but not on the minute.** The timer starts
  whenever the page loaded, so it is offset by an arbitrary number of seconds,
  and it does not resynchronise when a laptop wakes from sleep. In practice this
  means the palette can be up to a minute late crossing sunrise or sunset. Not
  visible in normal use; worth knowing if you are watching a terminator on
  purpose and it seems to arrive late.
