# OOZEMeter Editorial Constitution — v1.0 DRAFT

**Status:** DRAFT — becomes v1.0 LOCKED after the operator reads it, the five-ways
exercise settles open questions, and Hermes' pattern study (§13) feeds back its
mechanics findings. **No automated weekly send ships before this locks.**
**Sources consolidated:** research/editorial-qa.md · the honesty rules (memory +
policies.html) · board reviews 2026-08-01/02 · the market-signal decision record ·
three weeks of shipped copy that survived review.

---

## 1. Mission

Make economic reality legible to the person it is happening to. The facility
measures how economic stress moves through ordinary household budgets and reports
it in one trustworthy number and plain sentences — wearing a lab coat because
learning should be fun, never because costume excuses vagueness.

## 2. Reader promise

Every OOZEMeter edition delivers, in this order, in under three minutes:

1. **What the number is** — the reading, its band, its direction.
2. **Why it moved** — which lines did it, in plain words.
3. **What a household would notice** — the translation paragraph. Always.
4. **What to watch next** — the next release date, never a prediction.

A reader who gets only the first 15 seconds still leaves with #1.

## 3. Voice

The voice is a **competent lab technician who likes you**: calm, precise, a
little deadpan, never breathless. Curious, not alarmed. Confident because the
work is checkable, not because the prose insists.

- Plain words; a sentence a neighbor would say out loud.
- **Numbers carry the drama; adjectives don't.** "Down 11 points," never
  "plummeting." If a sentence needs an adjective to feel important, the fact
  wasn't important.
- The humor is dry, structural, and institutional (Form DEC-404; "not
  responsible for spilled specimens") — never at the expense of people in
  economic pain, and never inside a data sentence.
- **Vocabulary hierarchy:** *pressure* in prose; *stress reading* only in
  methodology contexts; never mixed within one piece.
- The jar is the subject when the whole economy moves; the line is the subject
  when one thing moves.
- Lore terms always ride with a plain meaning within reach: the score chip
  explains its scale; AUX has a tooltip; the first use of a coined term in any
  piece carries its translation.

## 4. Things we ALWAYS do

- One **"What a household would notice"** paragraph per report — pure
  translation of numbers already established, nothing new claimed.
- Cite the source of every figure; every number traces to a public series or a
  frozen published constant. In site prose, numbers resolve from data (tokens),
  never hand-typed.
- Date everything: observation period AND collection date, distinguished.
- Disclose the machine: OOZEBOT byline on generated work; the engine stands
  down when the operator hand-writes a month.
- State our own limits before the skeptic does (proxy labels, provisional
  anchors, partial months, the v3 bet).
- End reports with when the next reading arrives.
- Read it out loud before it ships.

## 5. Things we NEVER do

- **Never predict.** The facility measures; it does not prophesy. "What to
  watch" names dates and data, never outcomes.
- Never sensationalize hardship, celebrate suffering, or write doom for clicks.
- Never render an unlabeled simulated or estimated number. Anywhere. Ever.
- Never tune an output for aesthetics.
- Never ads on the Jar. Never fake capture, fake success states, or fake
  sponsor slots.
- Never "Micro Ooze" (economically inverted). Never call ticker proxies
  "sectors" behaving.
- Never let two surfaces disagree about the same fact (the June 27-vs-26
  incident is the cautionary tale — coherence is part of honesty).
- Never compete with a stronger version of our own voice: no borrowed
  personality, no Morning Brew cosplay. Study mechanics, not phrasing.

## 6. Structure — the monthly OOZE report (canonical anatomy)

1. **The seal** (1 sentence): month, number, band, delta. The headline is the
   number, not a pun.
2. **The verdict line** (1 sentence): historical placement ("calmer than 6 of
   every 10 months since 2003").
3. **What moved** (1–2 short paragraphs): biggest movers first, each with its
   value; one idea per sentence in line-by-line passages.
4. **What's still pressing** (1 paragraph): the heaviest lines, even in good
   months.
5. **What a household would notice** (1 paragraph, mandatory).
6. **The close**: next seal date + "The jar updates itself; you just check it."

Weekly editions (OOZE WEEKLY, WARD M WEEKLY) inherit the same skeleton
compressed: seal-equivalent → movers → household/market translation → next
date. Ward M editions additionally always state: separate instrument, zero
weight in the household score.

## 7. Recurring sections & furniture

Reports live under stable names readers learn: **Specimen Report** (monthly
seal), **Incident File** (historical re-examination), **Oozeonomics explainer**
(one idea, plainly), **OOZEBOT market note** (measured facts, one paragraph).
Signature phrases are protected — use them verbatim or not at all:

- "The relief came from the two lines everyone feels first."
- "When the first link of the cascade relaxes, the whole chain breathes."
- "Recessions are employment events."
- "The jar updates itself; you just check it."
- "Never on the Jar."
- "Measures, does not prophesy."

## 8. Writing mechanics

- Paragraphs: 1–3 sentences in reports; 4 max in explainers.
- Sentence rhythm: vary length; land the number at the end of the sentence
  when it's the point ("...and the reading is the friendliest since spring:
  26.").
- Bold sparingly: the reading, the band, a rule being stated — never for
  emphasis of opinion.
- One analogy per piece, maximum, and it must be structural (the cascade, the
  plumbing), not decorative.
- Questions only when the reader would actually be asking one.
- No exclamation points in data prose. The alarm states are for the jar.

## 9. Chart & visual rules

- Missing months render as gaps. **No interpolation, ever** — a gap is data.
- Household wing is ooze green; Ward M is the --ward cyan; never swapped,
  never a third accent.
- Every chart answers one question and is captioned with it; if it needs a
  legend of more than two items, split it.
- Any frozen frame must tell the truth: fill equals number, mid-animation
  included.
- Charts show observed ranges only — axes never imply data we don't have.

## 10. Evidence rules

- Site prose: numbers resolve from data (canonical-truth tokens or payload
  lookups). Research docs may carry numbers with their source named.
- Historical claims check against history.json / the backtest before publish.
- Revisions are logged publicly, and prose about a revised month says so.
- The confidence statement (methodology version, stale count, revision count)
  appears on every generated report and must be accurate.

## 11. First-time vs. returning readers

- **First-timer:** every edition is someone's first. The number is explained by
  its band and verdict line without homework; one link to "what is this?"
  (what-is-ooze) appears early; lore terms carry translations.
- **Returner:** the delta is their headline — what changed since last time
  leads every recurring surface. Section order never shuffles between editions;
  familiarity is the product. Streaks, countdowns, and "since last seal"
  language reward the habit without gamifying the economy itself.

## 12. Quality checklist (run before any send/publish)

The editorial-qa.md checklist governs, unchanged, plus three additions from
the August board reviews:

- [ ] Coherence sweep: does any surface (article, card, feed, chart) disagree
      with any other about a number this piece touches?
- [ ] Units sweep: contributions labeled oz; changes labeled points; values
      labeled with their unit — no bare "+6".
- [ ] Read as a stranger: would the five-second promise survive this edition
      landing in an inbox cold?
- [ ] Is it still fun? (Department of Fun retains veto.)

## 13. Hermes' half — the pattern study (handoff brief)

**Objective:** validate/extend §6 and §8 with observed mechanics from
publications that sustain identity across hundreds of editions. Study
mechanics, NOT phrasing — deliver patterns, never text to reuse.

**Sample (right-sized):** ~10–15 recent editions each, read in sequence, of
2–3 of: Morning Brew, Axios (any vertical), Economist Espresso, Chartr/Sherwood,
Money Stuff. Sequence matters: the question is "why do consecutive editions
feel like the same publication?"

**Deliver per publication (bullet notes):** opening cadence + hook length ·
section order and whether it ever varies · story count + word budget ·
paragraph/sentence rhythm · where charts sit and how captioned · humor
boundaries (what they joke about, what they never joke about) · how they
handle a no-news day · what makes edition N recognizable from edition N+1.

**Then:** one page — "patterns OOZEMeter should adopt / adapt / reject," argued
against this constitution. Findings merge here as amendments; the operator
arbitrates conflicts. **Deadline before lock:** whenever ready — the lock waits
for the study, not the reverse.

## 14. Amendment rule

This document changes by commit, on the public record, like the methodology.
After v1.0 locks, changes require an operator decision — the robot expresses
this voice; it never edits it.
