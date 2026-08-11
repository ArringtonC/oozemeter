# MESSAGE TO HERMES — 2026-08-11

**From:** Claude (advisory) · **Via:** the operator
**Supersedes:** `MESSAGE-TO-HERMES-2026-08-04.md` (still valid on blockers; this
one covers what changed and what you need to produce editions yourself)

---

## What happened this week

You regenerated the August 3 edition on August 10, and it came out in the **old
format** — no THE BOTTOM LINE, no HOUSEKEEPING divider, no AI byline, still
opening with ONE-MINUTE BRIEF and printing "line-stress points" at the reader.

**That is not your fault.** The editorial standard was frozen on August 4 in a
document nothing in the pipeline reads. This is the project's signature failure,
now for the fourth time: *we write the rule and never build the emitter.* The
byline was missing from 23 of 23 archive reports for the same reason.

So this message is the emitter spec.

---

## Read these two files before generating anything

1. **`research/editorial/EDITION-STYLE-GUIDE.md`** — frozen v1. The reader
   journey, section order, paragraph length, and the sentences that belong to us.
2. **`reports/editions/2026-08-11/edition.txt`** — this week's edition, written
   by hand to that guide. It is the worked example. Diff any generated edition
   against it for shape, not for content.

The August 3 and August 4 editions are archived and immutable. **Do not
regenerate them.** August 4 was the model; August 11 supersedes it as the most
current example.

---

## The structure every edition must emit

In this order. A reader asks these questions in this sequence.

1. **THE BOTTOM LINE** — 2–4 sentences. What improved, what didn't, nothing else.
   If a reader stops here they still have the story. **This is not optional and
   it is not the same as a one-minute brief:** it is the answer, not a summary of
   the sections below.
2. **The score, the scale, the band** — the number, then how to read it (calmest
   month = 10, worst of 2008 = 90, five bands, above 40 is where strain begins).
   "Sticky" never appears unexplained.
3. **What moved** — with observed values, not just stress points.
4. **What didn't improve** — the heavy lines.
5. **What we don't know** — gaps stated plainly.
6. **What's next** — current levels and what we're waiting for.
7. **Ward M** — *why a second gauge exists first, then its reading.* Never the
   value before the reason.
8. **HOUSEKEEPING divider** — the line *"Everything below is for people who want
   to check our work."* Corrections, fine print, and the AI byline go below it.

Paragraphs run 2–4 sentences. Most readers are on a phone.

---

## The canonical-truth gate is now real, and it will catch you

`scripts/narrative-check.js` runs over every article and **fails the build** on a
bare score literal. It caught three things in my draft this week that I would
otherwise have shipped. Use tokens:

| Token | Resolves from | Use for |
|---|---|---|
| `{{s:YYYY-MM}}` | `data/history.json` | any household score |
| `{{peak:YYYY-MM..YYYY-MM}}` | `data/history.json` | the worst month in a window |
| `{{market:YYYY-MM=N}}` | `data/market-history.json` | a **sealed** ward month |
| `{{market-current:YYYY-MM=N}}` | `data/market.json` | the current ward score |
| `{{revision-old:VER:YYYY-MM=N}}` | `data/revisions.json` | a pre-revision figure |

**Two traps it exposed, both worth understanding rather than working around:**

**`{{market-current}}` only resolves when every gauge shares one period.** Right
now five gauges read August and the credit gauge reads July, because August's
NFCI month isn't complete. So the token correctly refuses. **That is the gate
telling you something true:** the composite is mixing two months, and a
clean-looking "reads 27" would overstate its precision. The August 11 edition
therefore describes the *direction* and discloses the mix. Copy that pattern —
do not reach for a literal to get around a token that won't resolve.

**A token pinned to a period goes stale when data rolls forward.** The August 4
article used `{{market-current:2026-07=37}}`, which stopped resolving the moment
market data moved to August. Prefer `{{market:YYYY-MM=N}}` for anything you want
to remain true after the next collection.

---

## What actually changed in the data this week

Worth knowing because it shaped the edition and it is the kind of week you'll
have to narrate:

- **Household: no movement.** June is still sealed. July unemployment landed at
  4.1%, July inflation hasn't. The correct story is *why* it can't move yet.
- **Markets moved a lot.** Ward M fell about ten points. Sector Watch went from
  SOFTENING to CALM — 10 of 11 segments steady. Semiconductors recovered from
  −17.6% to −6.3%.
- **Breadth fell 37 points, and it was genuinely measured this time.** Last
  week's correction said we couldn't measure it. This week we could. That is the
  lede for the market section, and it is the most valuable kind of continuity a
  publication has: an admission followed by a delivery.

**Note the delta bug's real shape.** It manifests on a *re-run within one cycle*,
because `collect-market.js` reads `market.json` and then overwrites it. A single
run per cycle compares correctly against the previous cycle — which is why this
week's −37 is real. That narrows the fix (D-3) but does not remove it.

---

## The test email

The operator wants a test in their inbox. There is currently no automation for
this: `scripts/weekly-deliver.js` exists but **no workflow calls it**, and no
send has ever been recorded. Conditions:

- **Body from `reports/editions/2026-08-11/edition.txt`**, unmodified.
- **Say TEST in the subject and the first line.** It carries no validation
  record. A test must never read as a publication.
- **One recipient, the operator.** Recipients come from the environment or an
  untracked local file. `config/weekly-recipients.json` is gitignored and stays
  that way — a blanket `git add -A` already put a third party's address into a
  public push once.
- **Byline stays** *"Drafted with AI · approved by Arrington."* Never revert it
  to "Drafted by OOZEBOT" — OOZEBOT is a deterministic script with no model in
  the path, and `policies.html` now documents all three categories precisely so
  this byline can be true.
- **Email can't collapse.** The web version folds housekeeping into a `<details>`
  block; in email the divider does that job. Keep the divider, keep the section.
- **Do not mark it delivered.** It's a rendering test, not a publication event.

---

## Still open, unchanged from last week

**D-0** — no pipeline path to publish a correction. This is why the August 4
re-issue exists as prose with no artifacts. Do not close it by hand-writing
`validation.json` or `approval.json`; a hand-authored validation record is
manufactured confidence and a hand-authored approval is a fabricated approval.

**D-4** — `validation.json` structurally cannot report what `evidence.json`
records. `weekly-brief.js:226` filters `g.blocking && !g.ok`, and
`weekly-package.js:36` hardcodes both gates non-blocking.

**D-9** — `collect.js:108,110` score jobs and housing as `Math.max()` over two
series while the packet prints the first candidate. In any month where the second
branch binds, the evidence packet certifies an observable that did not produce
the score.

Full detail: `research/codex/CODEX-DIRECTION-2026-08-04.md`.

---

## The standing test

**A validator is worth building if, and only if, it would have caught something a
reader could have caught.** The narrative gate proved that this week by catching
a stale token in a published article before anyone read it. That is the model.
