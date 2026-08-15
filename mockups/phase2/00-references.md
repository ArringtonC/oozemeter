# Phase 2 — Design references: transferable patterns

**Design phase 2 of the gauntlet opened by `mockups/inspiration-board.html`.**
Read that file first. This document does not restate it; it extends it into the four problem
classes the panel scored lowest (EXPLANATION 4.5, FIRST-TIME COMPREHENSION 3.5).

Every pattern below carries a source line. Where the source is a URL, I opened it during this
research pass and quoted from what came back. Where no single artefact is the source, it says so
in those words. Nothing here is a remembered shot title.

---

## 0. SOURCE ACCESS LEDGER — read before trusting anything below

Phase 1 gathered its Dribbble references by browsing **in a real browser**. This pass had no
browser. I attempted the same URLs with a fetcher and they are not fetchable.

### Dribbble — COULD NOT ACCESS. All three phase-1 searches.

```
https://dribbble.com/search/data-storytelling          http=202  bytes=0
https://dribbble.com/search/magazine%20editorial%20layout  http=202  bytes=0
https://dribbble.com/search/anomaly-detection          http=202  bytes=0
```

`202 Accepted` with a **zero-byte body** — not a login wall, not a 403. Dribbble accepts the
request and returns no document at all to a non-browser client. A browser-User-Agent header
changed nothing. WebFetch on the same URLs returned empty content for both attempts.

**Consequence, stated plainly:** I cannot verify, extend, or re-check the five Dribbble
references in `inspiration-board.html` (Mansi Chauhan, Paperpillar, Tom Birch, Nikita Iarygin,
AppSignal, Avnish Poonia). They are marked `Seen` there because a human with a browser saw them.
I am not re-citing them as if I had. **This document adds no Dribbble references and invents no
shot titles or designer names.** If the Dribbble line of enquiry needs to continue, it needs a
browser session, not a research agent.

### Opened successfully, quoted below

| Source | URL | Used for |
|---|---|---|
| Nielsen Norman Group — Progressive Disclosure | `https://www.nngroup.com/articles/progressive-disclosure/` | P10 |
| GOV.UK Design System — Details component | `https://design-system.service.gov.uk/components/details/` | P11 |
| Wikipedia — Manual of Style, Lead section | `https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section` | P1, P12 |
| Wikipedia — `Template:Contradict-inline` | `https://en.wikipedia.org/wiki/Template:Contradict-inline` | P8 |
| Particle Data Group — Introduction, §5.2.2 | `https://pdg.lbl.gov/2011/reviews/rpp2011-rev-rpp-intro.pdf` | P7, P9 |
| EPA — Technical Assistance Document for the Reporting of Daily Air Quality (AQI), EPA-403/B-26-003, May 2026 | `https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf` | P4 |
| 15 U.S.C. § 1681g (Cornell LII) | `https://www.law.cornell.edu/uscode/text/15/1681g` | P5 |
| ONS — Consumer price inflation, UK: June 2026 | `https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/latest` | P2, P6 |
| UK Government Analysis Function — Communicating quality, uncertainty and change | `https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/` | P3, P13 |
| Datawrapper — What to consider when using text in data visualizations | `https://www.datawrapper.de/blog/text-in-data-visualizations` | P1 |
| NOAA National Hurricane Center | `https://www.nhc.noaa.gov/` | P14 |
| GitHub Status | `https://www.githubstatus.com/` | P15 |

The two PDFs (PDG, EPA) were downloaded by the fetcher, decompressed locally, and quoted from the
extracted text. Quotes are marked where ligature loss in extraction required me to restore
characters (`fi`, `ff`, `χ²`).

### Attempted and failed — recorded so nobody repeats the attempt

| Source | Result |
|---|---|
| `dribbble.com/search/*` (×3) | HTTP 202, zero bytes |
| `bls.gov/news.release/empsit.nr0.htm` | HTTP 403 |
| `ipcc.ch` AR6 WG1 Ch.1 and AR5 WG1 Ch.1 PDFs | HTTP 403 (both) |
| `consumerfinance.gov` ask-cfpb credit-score page | HTTP 404 |
| `fda.gov` %Daily Value pages (×3 paths) | HTTP 404 |
| `ft-interactive.github.io/visual-vocabulary/` | rendered empty (JS-only) |
| `blog.datawrapper.de/chart-titles/` | 301 → `www.datawrapper.de/blog/chart-titles/` → 404 |

**One near-miss I am deliberately not citing.** A web search surfaced the FDA's "5% DV or less is
low, 20% DV or more is high" rule attributed to fda.gov, but every fda.gov URL I tried returned
404, so I could not read the page myself. The Nutrition-Facts %DV idea is a genuinely good
composition reference and it is **not** used below, because a search-result snippet is not a
source I opened. Flagging it as the best unexplored lead for anyone with a working browser.

### Live payload, re-verified during this pass

`data/latest.json`, month `2026-07`, ooze `26`:

```
gas 4 · housing 7 · credit 6 · auto 5 · jobs 2 · inflation 2 · financial 0
foreclosures 0 (AUX) · manufacturing 0 (AUX)
```

`data/editorial.json` has **13 keys**: `month monthLabel generated byline verdict summary story
lines confidence newsletter rssSummary social articleSlug`. The homepage renders `verdict` and
`articleSlug`. The brief's two critical defects are confirmed against the current tree, not taken
on trust.

---

# CLASS A — Leading with a sentence rather than a figure

The panel's core complaint. `26` is rendered beautifully and explains nothing.

---

## P1 · The title carries the finding; the number is demoted to evidence

**Pattern.** The largest, boldest, highest-contrast type on the surface is a *sentence stating
what was found*. Everything that identifies, qualifies, sources or quantifies it drops to a second
typographic rank that is unmistakably different — not slightly smaller, categorically different.
Exactly two ranks. Never three.

**Source.** Datawrapper, *What to consider when using text in data visualizations* —
`https://www.datawrapper.de/blog/text-in-data-visualizations`. Verbatim: *"The **biggest** and
**boldest** text with the **highest contrast** should be reserved for the most important
information."* And on hierarchy discipline: use *"only two levels of hierarchy that are clearly
different from each other — like a 12px gray and a 14px black."* Sources stay *"small, thin, and
gray."* The guiding instruction for the title itself: *"Be conversational first and precise
later."*

Corroborated by Wikipedia MOS:LEAD (see P12), which requires the opening to be *"in plain
English"* and warns *"Do not overload the first sentence by describing everything notable about
the subject."*

**Why it fits an instrument that must not overstate.** This is the cheapest available honesty
mechanism, because *a sentence can be wrong in ways a number cannot*. `26` is unfalsifiable as
presented — it is the output of a published transform, so it is always "correct" and therefore
never accountable. A sentence commits to a claim someone can check, which is the entire premise of
this site. It also removes the failure mode the panel actually punished: a reader who sees only a
figure supplies their own story, and the story they supply is not governed by the Constitution.

Note the direction of travel this implies for OOZEMeter specifically: it does **not** mean shrink
the jar. It means `EDITORIAL.story` — which already exists, already passes the narrative gate,
and is rendered nowhere — gets display-rank typography, and the digits stay mono. Phase 1's
Family A already found this independently ("a display CLAIM line containing *no digits*, and a
mono MEASUREMENT line beneath it"). Two ranks, and the ranks never merge.

**Empty state.** Degrades cleanly and is arguably *better* in the empty state, because a quiet
month has a genuinely good sentence available — the month held. The failure mode is the opposite
one: a templated sentence. Phase 1 already flagged this against the Paperpillar reference
("*if a robot templates this sentence every week it degrades into mad-libs within a month*"). The
mitigation is structural, not editorial: the display line must be allowed to be **short**. A
one-clause month gets one clause. A layout that reserves two lines of `--display` at
`clamp(1.8rem, 4vw, 2.9rem)` will pressure the generator into padding, and padding on this site is
an intensifier by another name.

---

## P2 · The lede is a sentence containing the number, not a number with a caption

**Pattern.** The first thing on the page is a complete sentence carrying subject, direction,
magnitude and comparison **in that order**, with the figure embedded mid-sentence rather than
standing alone above it.

**Source.** ONS, *Consumer price inflation, UK: June 2026* —
`https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/latest`.
The bulletin's first Main Point, verbatim: *"The Consumer Prices Index including owner occupiers'
housing costs (CPIH) rose by 2.8% in the 12 months to June 2026, down from 3.0% the previous
month."*

The structural detail worth stealing is the ordering. Nothing numeric appears until the reader
already knows *what is being measured* and *which way it went*. The comparison (`down from 3.0%`)
is in the same sentence as the level, not in a separate delta chip.

**Why it fits.** OOZEMeter currently splits this one sentence across four separate visual
components — score, band chip, delta chip, verdict line (`index.html:37–42`). Each is individually
honest and the assembly is not a sentence, so a first-time reader has to compose the meaning
themselves, and the audit's ladder-integrity test shows they compose it wrong. Recombining them
into one grammatical unit costs no new data and no new claim. It is a rendering change to material
already on the page.

**Empty state.** This *is* the empty-state pattern — ONS publishes this identical structure in a
month where nothing interesting happened, and it reads fine, because "held at" is a legitimate
verb in the ladder. There is no version of this that needs a contradiction to exist. That makes it
the safest pattern in this document.

---

## P3 · Vital caveats ride in the headline block, not in a methodology page

**Pattern.** If a quality or coverage limitation changes what a reader may conclude, it appears
*inside* the key-findings block at the top — not as a footnote, not one click away.

**Source.** UK Government Analysis Function, *Communicating quality, uncertainty and change* —
`https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/`.
Verbatim: *"Key findings in statistical releases should include any vital messages about quality
(those that have a profound impact on what can be drawn from the numbers)."* And: *"Be honest and
transparent about where the evidence comes from and its limitations"*; *"explain what you can and
what you cannot conclude from the findings."*

The guidance also warns against jargon that misleads lay readers, naming *"error"* and *"bias"*
specifically as words to avoid with general audiences.

**Why it fits.** This is the source that most directly ratifies the audit's "WHAT DOESN'T ADD UP?"
module and settles its *placement*. The module is not a nice-to-have sidebar; under this standard,
a limitation with "a profound impact on what can be drawn from the numbers" belongs in the key
findings. The July 2026 employment blind spot is exactly that. It also ratifies the audit's
insistence that the module's own limits block ship with it — "explain what you cannot conclude"
is the same instruction as *state our own limits before the skeptic does*.

The jargon warning is a live constraint on our own copy: "falseticker" (phase 1, Family B) is a
legitimate term of art but it is not plain English, and this standard says it cannot be the
carrier — it can only be the *label on* a mechanism already explained in plain words.

**Empty state.** The pattern requires a caveat *only when one has profound impact*. In a month
with no material limitation, nothing renders — and crucially, that is compliance, not absence.
This is the strongest external argument against manufacturing a contradiction to fill the slot:
the governing standard for statistical publication says the block is conditional by design.

---

# CLASS B — Showing composition without a chart

What is the 26 made of? Today: nothing above the ledger answers this, and the four featured cards
answer it wrongly (8 of 26 ounces featured; 18 of 26 absent; one card at 0 oz).

---

## P4 · Name the responsible component as a required field beside the number

**Pattern.** A composite index is published with a **mandatory companion field** naming which
component produced it. The field is not optional, not a hover, not a drill-down. It sits in the
same reporting record as the value, every time, including when it is boring.

**Source.** EPA, *Technical Assistance Document for the Reporting of Daily Air Quality — the Air
Quality Index (AQI)*, EPA-403/B-26-003, May 2026 —
`https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf`.

The required reporting record, verbatim from §II *What to Report*, is a bulleted list:

```
reporting area
reporting period
main pollutant (the pollutant with the highest AQI value)
AQI value
category descriptor and color (if your report uses color)
sensitive groups for all pollutants with an AQI over 100
```

Note the ordering: **the main pollutant is listed before the AQI value itself.** And the
computation rule, verbatim from §IV: *"The AQI is the highest value calculated for each pollutant
as follows…"*, with the worked example closing *"In this case, the index is 148 (the maximum of
148 and 126) and the main pollutant is O3."*

**Why it fits.** This is a government-mandated, decades-old, publicly checkable precedent for the
exact thing OOZEMeter fails to do: a 0–500 composite that a non-expert reads daily, which is
**never published without naming what drove it**. It also legitimises a structure the site already
has and hides — `jobs` and `housing` are `Math.max()` of two series, so those lines have a "main
pollutant" (a binding arm) in precisely the AQI sense, and the consolidated verdict notes the jobs
line has switched arms 38 times in 282 months with no surface saying which arm is talking.

For the featured-canister defect this yields a rule with outside authority behind it: **the
attribution field is ranked by contribution to the published value, never by movement.** AQI does
not feature the pollutant that changed most since yesterday. It features the one responsible for
the number.

**Why "without a chart" holds.** The entire AQI attribution mechanism is one noun. No bar, no
donut, no treemap. This is the proof that composition is a *text* problem before it is a graphics
problem.

**Empty state.** Perfect degradation, and this is the pattern's best property: on a clean-air day
AQI still names a main pollutant. There is always a largest contributor, even when everything is
calm and nothing moved. **A composition module built this way can never be empty** — which makes
it categorically safer than a contradiction module, and argues for shipping it first. In July 2026
the field reads `housing` on a month where housing's delta is `0`. That is the pattern working, not
failing.

---

## P5 · Rank the contributors, cap the list at four, order by effect

**Pattern.** Alongside a score, publish the small set of factors that most affected it, **ordered
by how much they affected it**, with a hard cap on how many. The cap is a feature: it forces
ranking and prevents the list decaying into a dashboard.

**Source.** 15 U.S.C. § 1681g(f)(1)(C), via Cornell LII —
`https://www.law.cornell.edu/uscode/text/15/1681g`. Verbatim, the credit-score disclosure must
include:

> *"all of the key factors that adversely affected the credit score of the consumer in the model
> used, the total number of which shall not exceed 4"*

Listed in order of importance by their effect on the score.

**Why it fits.** A credit score is the closest mass-market analogue to the jar that exists: an
opaque 0-N composite, consumed by non-experts, whose issuers are *legally compelled* to explain
composition in plain language without a chart. Congress landed on **four, ranked by effect**. The
homepage already features four cards. The defect is purely the sort key: `Math.abs(delta)` is
"biggest mover", where the statute's principle is "biggest effect".

This reference is also the answer to the obvious objection that heaviest-by-ounces is boring
because it will show the same three lines for months. The statute accepts that. Stability of the
key-factor list is what makes it trustworthy; a list that reshuffles monthly is measuring noise.

**Caution — the one thing not to inherit.** The statute says *adversely* affected. OOZEMeter's
ounces are all non-negative contributions to stress, so there is no "positive factor" ambiguity to
resolve. Do not import the adverse/beneficial split; it does not map, and inventing a "relief
factors" counterpart would be a second composite by the back door, which §6 of the audit rejects.

**Empty state.** Cannot be empty — like P4, there are always four largest contributors. In a calm
month the module renders four small numbers and that is an honest, informative surface. It reads
as *"here is what little pressure there is, and where it sits."* This is the module that carries
the product between monthly seals.

---

## P6 · The composition sentence, including the null clause

**Pattern.** State composition in prose as *"the largest contribution came from X"* — and, when
nothing worked the other way, say so explicitly in the same breath with a **null clause** rather
than falling silent.

**Source.** ONS, *Consumer price inflation, UK: June 2026*, §3 *Notable movements in prices* —
same URL as P2. Verbatim: *"The largest downward contribution came from transport, particularly
motor fuels. There were no large, offsetting upward contributions."*

**Why this is the single most useful sentence I found.** That second clause is a designed,
dignified empty state *embedded inside a live one*. The national statistical office of the UK
publishes "nothing pushed the other way" as a finding, in the same paragraph, at the same
typographic weight. It is not filler and it is not an apology. It is information: a reader who
knows there were no offsetting movements knows something real about the month.

It also demonstrates the two-level composition grammar OOZEMeter needs — a category
(`transport`) narrowed by a specific (`particularly motor fuels`). That maps exactly onto
line → series: *"Housing was the largest source of pressure, particularly the 30-year mortgage
rate."* One sentence, no chart, satisfies the Constitution's §4 requirement that a named line
carry its observed value in the same sentence.

**Why it fits.** OOZEMeter's `EDITORIAL.story` for July already does something close to this and
is not rendered. This reference tells us the target is not just to render it, but to make sure the
generator can emit the *null clause* — otherwise a flat month produces a sentence that trails off,
and trailing off reads as concealment.

**Empty state.** This pattern *is* an empty-state technology. Its degraded form is the strongest
version of it. Draft, in tokens:

> *"Housing was the largest source of pressure in {{s:2026-07}}'s reading, with the 30-year
> mortgage rate at 6.67%. No line moved more than three points, and nothing offset it."*

---

# CLASS C — Disagreement as a permanent published state

Phase 1 established the aviation FLAG/DISAGREE split and the `ntpq` falseticker mark. Both hold.
Three additions that harden the concept — in particular against the failure mode where a
disagreement marker starts to look like a severity level.

---

## P7 · Publish a disagreement coefficient that provably never moves the headline

**Pattern.** When independent inputs disagree by more than their stated precision, publish a
**named scalar quantifying the disagreement, inline, next to the value** — and state as a
standing rule that this scalar does not alter the value itself.

**Source.** Particle Data Group, *Introduction* §5.2.2 *Unconstrained averaging* —
`https://pdg.lbl.gov/2011/reviews/rpp2011-rev-rpp-intro.pdf`. The PDG averages the world's
measurements of each particle property. When the inputs disagree (χ²/(N−1) > 1), it inflates the
quoted error by a scale factor:

> *"S = [χ²/(N−1)]^(1/2)"*

and reasons, verbatim:

> *"The large value of the χ² is likely to be due to underestimation of errors in at least one of
> the experiments. Not knowing which of the errors are underestimated, we assume they are all
> underestimated by the same factor S."*

The load-bearing sentence for our purposes:

> *"We emphasize that our scaling procedure for errors in no way affects central values. And if
> you wish to recover the unscaled error, simply divide the quoted error by S."*

And the published rendering — the disagreement is printed **in the table, in parentheses, beside
the number**, permanently, in every edition:

```
WEIGHTED AVERAGE
0.006 ± 0.018 (Error scaled by 1.3)
```

**Why it fits, and why it is the most important reference in this document.** The audit's hardest
constraint on the cross-check module is that it must *never become a second score* — "two numbers
is zero numbers", and the parenthetical *"(Cross-check series carry no score weight. This does not
change the reading of 26.)"* is doing that work in prose, once, hopefully read.

PDG solves the same problem structurally instead of editorially. `(Error scaled by 1.3)` is a
disagreement annunciation that is **grammatically incapable of being mistaken for the value**,
because it sits inside the uncertainty term, not the central term — and the standing rule
guarantees invertibility ("simply divide the quoted error by S"). That is a far stronger promise
than a sentence asking readers to believe the number did not move.

The transferable move for OOZEMeter is not to adopt S — we have no sampling model and the audit
correctly rejects confidence intervals on the jar. It is to adopt the **grammatical position**: the
disagreement mark goes in a slot that is visibly not the score slot, is present in every edition,
and carries a published rule of non-interference. Phase 1's aviation DISAGREE lands the mark *in
the gutter between two figures*; PDG lands it *in a parenthetical after the figure*. Both are
"outside the numeral". That convergence from two unrelated fields is the encoding law.

**One more rule worth taking.** PDG applies S *only* when disagreement exceeds a threshold, and
withholds the average entirely at the extreme: *"If χ²/(N−1) is very large, we may choose not to
use the average at all."* We have the analogue already — the audit's dwell requirement and the
consolidated verdict's noise floors (±168k for a 1-month payroll change). The reference confirms
that a threshold plus an abstention state is normal practice in a discipline that publishes
disagreement for a living.

**Empty state.** Exemplary. When χ²/(N−1) ≤ 1 the parenthetical simply **is not printed**, and the
table row looks like every other row. No "S = 1.0", no "no disagreement detected", no grey
placeholder. The absence of the mark is the message, and it is legible because the mark's presence
is rare and its slot is fixed. **This is the cleanest empty-state answer available: design the loud
state as an addition to the quiet state, never the quiet state as a subtraction from the loud
one.** If the quiet state needs a component that says "nothing to report", the loud state was
designed first and the empty state will always look like a hole.

---

## P8 · Mark the contradiction in place; the disputed text stays fully visible

**Pattern.** A contested statement is tagged with a small inline marker immediately following it.
The statement is **not** removed, greyed, struck, corrected, or relocated to a warning box. The
marker is one bracketed word. Detail lives in a tooltip.

**Source.** Wikipedia, `Template:Contradict-inline` —
`https://en.wikipedia.org/wiki/Template:Contradict-inline`. It marks *sentences or phrases that
contradict other material within the same page or elsewhere*. It renders as an italicised
bracketed tag:

```
[contradictory]
```

The documented placement instruction is to *"append this template immediately after the
contradictory material."* The disputed text remains fully visible; hovering the marker reveals
where the conflicting material is and what the conflict is.

**Why it fits.** Independent convergence with phase 1's two strongest instrumentation references —
aviation DISAGREE ("both readings stay fully displayed and unchanged") and `ntpq`'s single-glyph
falseticker mark. Three unrelated domains (transport aircraft, time synchronisation, encyclopedia
editing) arrived at the same three rules: **keep the claim, mark it in place, one token wide.**
That is now a convention, not a borrowed idea, and phase 1's Family D observation stands — the
design field has largely not solved this while several engineering and editorial disciplines have.

The specific addition Wikipedia makes over the phase-1 pair is that it is **prose-native**. Aviation
and `ntpq` mark rows in a table of figures; Wikipedia marks a sentence. OOZEMeter's critical defect
is a missing *paragraph*, and the module the audit designed prints prose. This is the reference for
marking `EDITORIAL.story` itself — a story sentence that the cross-check contradicts can carry the
mark inline rather than being contradicted 400px lower by a separate red panel that a reader may
never connect to it.

Concretely, this dissolves the July 2026 failure at its actual site. Today the household paragraph
would say employment was steady and a module below would say the opposite. Marked in place, the
clause carries its own dissent and the two can never be read separately or screenshotted apart —
which is the Constitution's §12 travel test.

**Why it fits an instrument that must not overstate.** The marker asserts nothing. It does not say
the sentence is wrong; it says *another published thing disagrees*, and shows you where. That is
the maximum claim our evidence supports for the employment case, where the arithmetic of the
labour-force exit is closed but the interpretation is not.

**Empty state.** Ideal, for the same reason as P7: the marker is an addition to unmarked prose. In
a month with no contradiction the paragraph is simply a paragraph. There is no empty container, no
"no disputes on this page" banner — Wikipedia does not print one, and neither should we. The
degraded state costs exactly zero pixels.

**Constraint.** Wikipedia's markers are *maintenance* tags — they mean "someone should fix this."
Ours would mean "these two published series disagree and both stay." Do not inherit the
apologetic register. And do not inherit the tooltip as the only affordance: a hover-only
disclosure fails on touch and fails the audit's requirement that Level 4 be visible with no click.
The marker should anchor to the visible module, not replace it.

---

## P9 · When the inputs split into groups, publish the picture and extract no numbers from it

**Pattern.** When disagreement is structured — the inputs fall into two camps rather than
scattering — publish a visual of the split, and state explicitly that **no quantity is derived
from it**. It is a reading aid with no authority.

**Source.** PDG, same document, §5.2.2(b). When enough precise measurements disagree
(χ²/(M−1) > 1.25 with M ≥ 3), PDG prints an *ideogram*. Verbatim:

> *"Sometimes one or two data points lie apart from the main body; other times the data split into
> two or more groups. We extract no numbers from these ideograms; they are simply visual aids,
> which the reader may use as he or she sees fit."*

**Why it fits.** This is the licence phase 1's re-polarised slopegraph needs, and the guardrail it
needs at the same time. Phase 1's Family D calls re-polarisation "the single most important item on
this board" — four employment indicators on a shared toward-stress axis, one line leaving the pack.
The risk the audit would raise is that a chart shown at that prominence starts to look like a
second instrument. PDG's answer is to ship the picture *and print its lack of authority as part of
the object*. "The reader may use it as he or she sees fit" is a register the Constitution can
adopt directly.

It also validates the shape of the claim. PDG's ideogram exists precisely because *"the data split
into two or more groups"* — which is exactly the July employment case, and exactly what the raw-axis
view conceals.

**Empty state.** Conditional by construction — the ideogram is printed only past a stated
threshold, so a quiet month shows no chart at all and nothing marks its absence. The pattern to
avoid is the one the audit already found live on all nine indicator pages: `indicator.html:77–80`,
a `<h2>`-headed "Stress History — PENDING" panel containing no chart. *"Honesty does not require a
monument to an absence."* P9's discipline is the opposite of that panel: no threshold crossed, no
container.

---

# CLASS D — Progressive disclosure that lets a casual reader stop early

The audit's ladder ships L1, half of L2, and a jump to L5. These references govern where the cuts
go.

---

## P10 · Disclose everything frequently needed up front; the second level is for rare occasions

**Pattern.** Split by *frequency of need*, not by complexity, length, or how proud you are of it.

**Source.** Nielsen Norman Group, *Progressive Disclosure* —
`https://www.nngroup.com/articles/progressive-disclosure/`. Verbatim definition: *"Initially, show
users only a few of the most important options. Offer a larger set of specialized options upon
request."* The governing rule, verbatim: *"disclose everything that users frequently need up front,
so that they have to progress to the secondary display only on rare occasions."* With the
counter-constraint: *"the primary list can't contain too many options or you'll fail to
sufficiently focus users' attention."* NN/g reports the technique improves *"3 of usability's 5
components: learnability, efficiency of use, and error rate."*

**Why it fits.** This is the test that condemns the current homepage in one line. "Why did the
number move" is needed by every reader on every visit; it is currently one click away in
`article.html`. Meanwhile the Ward M market card — an explicitly zero-weight experimental wing —
outranks the first-timer explainer on the page. Frequency of need is inverted in both directions
simultaneously.

The counter-constraint is equally binding on our fix and cuts against enthusiasm: rendering
`EDITORIAL.story` **and** `summary` **and** the household paragraph **and** a cross-check module
**and** four re-sorted canisters above the ledger would be a primary display that fails to focus
attention. Something has to lose. On the frequency test, the ordering is: composition (P4/P5,
needed every visit, never empty) → the story sentence (P1/P2, needed every visit) → the
disagreement mark (P7/P8, needed rarely, and *by design* usually absent).

**Empty state.** The frequency test is what protects the empty state from becoming filler. A module
that is empty most months is by definition not frequently needed, and therefore belongs at level 2
— *unless* it is designed as an inline mark on level-1 material (P8), which costs nothing when
absent. That is the reconciliation between "this must be visible with no click" and "this is empty
most months", and it is the argument for the contradiction living as a mark on the story rather
than as its own card.

---

## P11 · Never put information the majority needs behind a disclosure control

**Pattern.** A collapse/expand control is legitimate only for content *some* users need. If most
users need it, it may not be collapsed — regardless of how much space it saves.

**Source.** GOV.UK Design System, *Details component* —
`https://design-system.service.gov.uk/components/details/`. Verbatim: *"Use the details component
to make a page easier to scan when it contains information that only some users will need."*
And the prohibition, verbatim: *"Do not use the details component to hide information that the
majority of your users will need."*

**Why it fits.** The sharpest available rule for placing the Level 4 / Level 5 boundary. The
audit's "Show the evidence ▸" expansion — series IDs, transforms, anchor pairs, the counterfactual
arithmetic, the limits block — is textbook *some users*, and belongs behind the control. The one
paragraph explaining that two job numbers point opposite ways is *majority*, and may not be.

It also disposes of a tempting compromise that will come up in mockup review: collapsing the
household paragraph "to keep the jar above the fold". Under this rule that is not a layout trade,
it is a prohibited use of the component.

**Empty state.** A disclosure control with nothing behind it must not render. The GOV.UK framing
makes the empty-state question concrete: if `crosschecks` did not run, there is no "some users"
content, so there is no control — and per the audit's no-data sentence, the *reason* ("one or more
comparison series has not released. A missing month stays missing.") goes at level 1 as prose,
because that is a quality message with profound impact under P3.

---

## P12 · The opening must stand alone, and must survive being read on its own

**Pattern.** Write the opening block so that a reader who reads *only* it leaves with a correct,
complete, proportionate understanding. Not a teaser, not an abstract that depends on the body — a
standalone artefact.

**Source.** Wikipedia, *Manual of Style/Lead section* —
`https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section`. Verbatim: the lead
*"should stand on its own as a concise overview of the article's topic. It should identify the
topic, establish context, explain why the topic is notable, and summarize the most important
points, including any prominent controversies."* On restraint: *"Editors should avoid lengthy
paragraphs and overly specific descriptions – greater detail is saved for the body of the
article."* On the first sentence: *"Do not overload the first sentence by describing everything
notable about the subject."*

**Why it fits.** Two clauses do real work here.

*"Including any prominent controversies"* — the canonical standard for lead-writing says a
disagreement material to the subject belongs in the standalone opening, not deferred. That is
independent confirmation of P3 and of the audit's placement of the cross-check module above the
fold rather than in a methodology annex.

*"Stand on its own"* — this is the audit's ladder-integrity test restated as an editorial rule, and
it is the acceptance criterion every phase-3 mockup should be graded against. Give a stranger only
what is visible without scrolling or clicking, ask *"how is the job market?"*, and the answer must
be right. Today it is wrong. That single test is worth more than any amount of layout critique, and
it converts a subjective panel score into a pass/fail.

**Empty state.** Standing alone is *easier* in a quiet month, not harder. The risk is the reverse
of the loud month's risk: a lead with no controversy clause may feel thin, and the temptation is to
pad it. MOS:LEAD's own instruction — avoid lengthy paragraphs, save detail for the body — is the
defence. A short lead is a compliant lead.

---

## P13 · Say what you cannot conclude, in the same block as what you can

**Pattern.** Pair every published finding with an explicit statement of its boundary, at the same
level of the hierarchy, in plain words — not in a methodology page, not in a footnote.

**Source.** UK Government Analysis Function, *Communicating quality, uncertainty and change* (same
URL as P3). Verbatim: *"explain what you can and what you cannot conclude from the findings"*, and
the rationale: clear communication *"protects the integrity of the findings and supports the users
of our numbers in drawing the correct conclusions."*

**Why it fits.** This is "we measure, we don't forecast" restated as a *layout* obligation rather
than a slogan. Today the standing rule lives in the site's voice and in `notes.html`; under this
standard it should be discoverable at the point of the claim. It is also the external warrant for
the audit's LIMITS block, and for the consolidated verdict's proposed rule that *the editorial
voice may describe what the jar measured; it may never assert the absence of a phenomenon the jar
cannot measure* — the exact sentence that already shipped and crossed the line in the June seal.

**Empty state.** This one is **conditionally dangerous and needs a design decision in phase 3.** A
boundary statement attached to a quiet month can read as manufactured drama — *"we cannot conclude
what happens next"* on a month where nothing happened is noise that trains readers to skip the
block, which then fails in the month it matters. Two candidate resolutions for mockup:

1. **Standing, invariant, small.** One fixed sentence in a fixed slot, identical every month, never
   rewritten. Its constancy is what makes it credible and skippable. Analogous to how the AQI
   record always carries its category descriptor.
2. **Conditional, at the claim.** The boundary renders only where a specific claim needs it,
   inline (P8's mechanism), and there is no standing block at all.

These are genuinely different products and both are defensible. **Mock both.** Do not let it be
decided by whichever is easier to build.

---

# CLASS E — The empty state, judged as hard as the loud one

The two references below are the whole argument, and they agree.

---

## P14 · The absence of the event is published as a plain declarative sentence

**Pattern.** When there is nothing to report, publish a complete sentence saying so, in the normal
content slot, in the normal typography. No illustration, no greyed placeholder, no "check back
later", no reassurance.

**Source.** NOAA National Hurricane Center — `https://www.nhc.noaa.gov/`. Verbatim, in the
Atlantic basin section: *"There are no tropical cyclones in the Atlantic at this time."* It is
presented as plain text in the same position the outlook occupies during an active season, without
additional formatting or visual treatment.

**Why it fits.** The most consequential public-safety instrument in the United States states its
empty condition in eleven words with no design applied, and nobody reads it as the site being
broken. The dignity comes from the sentence being *complete* and *in the same place as the live
content* — not from decoration. Note also the temporal hedge doing precise work: *"at this
time"* — an observation about now, not a claim about later. That is our standing rule in someone
else's house.

Phase 1's proposed copy — *"Nothing contradicts this week. The signals agree."* — is already in
this register. The refinement this source suggests is the temporal qualifier and the removal of
the second sentence's editorialising: *"The signals agree"* is a mild claim about the world, where
*"no cross-check disagreed this month"* is a statement about the instrument, which is what the
Constitution's §5 register and the audit's own state label ("*because it describes the instrument,
not the economy*") both want.

**Empty state.** This *is* the empty state, and it is the reference standard. Grade every phase-3
mockup's quiet month against it: is the empty state a **sentence in the content slot**, or is it a
component in a disabled skin?

---

## P15 · Structural invariance: the quiet state and the loud state are the same layout

**Pattern.** The all-clear renders the identical structure as the alert — same components, same
order, same positions. Only the words and the state tokens change. There is no separate "empty"
layout to design, and therefore no separate layout to get wrong.

**Source.** GitHub Status — `https://www.githubstatus.com/`. The all-clear is a prominent heading
reading *"All Systems Operational"*, followed by exactly the same per-service list that renders
during an incident (Git Operations, Webhooks, API Requests…), each carrying its own state label
and 90-day history. The summary heading changes; the anatomy does not.

**Why it fits.** This is the operational form of the principle P7 established in metrology: **design
the quiet state first, and let the loud state be an addition to it.** If the loud state is designed
first, the quiet state is defined by what has been removed, and a layout defined by removal always
reads as broken or as filler — which is precisely the risk phase 1 named as the biggest in the whole
exploration.

It converts the empty-state requirement from an act of restraint into a structural property. A
reviewer can check it mechanically: diff the quiet mockup against the loud mockup. If any component
appears in one and not the other, the empty state has been designed as a subtraction and will
degrade.

**Empty state.** Definitional. The one caution: status pages are read *because* the reader suspects
trouble, so an all-clear is a satisfying answer to a question already asked. Nobody arrives at
OOZEMeter asking "is there a contradiction?" — so structural invariance is necessary but not
sufficient. The quiet month still has to carry a reason to exist, and P4/P5 are what supply it: a
composition module that can never be empty, sitting where the eye already is.

---

# Cross-cutting encoding law — additions to phase 1's Family D

Phase 1's Family D grades every mockup. These are the additions this pass earns. They are phrased
as pass/fail so a reviewer can apply them without taste.

**L1 — Two typographic ranks, never three.** One display rank carrying a claim in words, one mono
rank carrying measurement. A third intermediate rank means the claim and the evidence have started
negotiating. (P1)

**L2 — The attribution field is ranked by contribution, never by movement.** Any module that sorts
by `Math.abs(delta)` fails on sight. If a "biggest mover" slot is wanted it is an *additional*
labelled slot, not the sort key of the main list. (P4, P5)

**L3 — Cap the contributor list at four, ordered by effect.** Four has legal precedent for exactly
this problem. A fifth card is a dashboard. (P5)

**L4 — A disagreement mark occupies a slot that is grammatically not the score slot.** Inside a
parenthetical, in a gutter, or appended to a sentence — never adjacent to or styled like the
headline numeral, and never a colour change applied to it. (P7, P8, and phase 1's aviation split)

**L5 — Design the quiet state first. The loud state is an addition to it.** Reviewable by diffing
the two mockups: a component present in one and absent in the other is a defect. (P7, P15)

**L6 — Empty means a sentence in the content slot, not a component in a disabled skin.** (P14)

**L7 — The visible-without-interaction surface must pass standalone.** Give a stranger only what
renders above the fold, ask "how is the job market?", and the answer must be correct. This is a
gate, not a heuristic. (P12)

**L8 — Nothing the majority needs may sit behind a disclosure control.** Including for layout
reasons. (P11)

**L9 — Colour tokens.** Every pattern above is carried by type, position and words; none requires
hue. Where a state token is needed use `--ooze` / `--amber` / `--muted` / `--dim`. **`--ward` is
reserved for Ward M market references and may not appear in any household surface**, including a
contradiction mark, an evidence link, or a tooltip. Note phase 1's live WCAG finding: `--green`
scores 15.23:1 and `--red` 6.02:1 on `--bg`, so the two are not interchangeable as a pair and hue
may never be the sole carrier.

---

# What this pass did NOT find, and what that means

**No design-industry source solved the disagreement problem.** Phase 1 reached this conclusion by
browsing Dribbble; I reached it by a different route, since every reference in Class C that
survived scrutiny comes from particle physics, encyclopedia maintenance, aviation, time
synchronisation, or monitoring — and none from a design publication. Two independent methods, same
answer. Phase 1's white-space finding stands and is strengthened: **whatever is built here is
genuinely distinctive rather than a borrowed pattern**, and Family B deserves the weight phase 1
gave it.

**Composition, by contrast, is a solved problem — outside design.** The AQI main-pollutant field
and the statutory four-key-factor cap are mature, mandated, mass-market solutions to "explain a
composite to a non-expert without a chart", and OOZEMeter is currently below both standards while
having all the data required to meet them. This is the lowest-risk, highest-return work in the
phase, and unlike the contradiction module it **cannot produce an empty state at all**.

**The unexplored lead worth a browser session.** Consumer product labelling — the FDA Nutrition
Facts %DV column in particular — is the one composition-without-a-chart family I could not open
(three 404s). It is a share-of-a-fixed-whole rendered as a column of integers with a published
plain-language threshold rule, which is structurally very close to ounces-of-26. Anyone continuing
this research with a browser should start there, and with the phase-1 Dribbble shots that I could
not re-reach.

---

# Appendix — two repo facts verified during this pass that constrain phase 3

Both were checked against the working tree today because the patterns above depend on them. Both
differ from what the prior-art documents say, so they are recorded here rather than assumed.

### A1 · The narrative gate now scans `index.html`. The audit says it does not.

`research/forensic/00-CONSOLIDATED-VERDICT.md` §C1 states the gate *"never opens `lab.js`,
`data/editorial.json` or `feed.xml`."* That is **no longer true** of the current
`scripts/narrative-check.js`, which loads `lab.js` at line 183 and, at line 203, iterates:

```js
for(const surface of ['feed.xml','data/editorial.json','index.html']){
```

failing the build on any unresolved `{{…}}` token reaching a reader, with `data/editorial.json`
explicitly exempted by a comment: *"editorial.json is a token CARRIER by design — its consumers
resolve it."*

**Consequence for P1/P2/P6.** `EDITORIAL.story` cannot be dropped into `index.html` as a string.
Verified: `story` is 396 characters and carries **two** `{{s:2026-07}}` tokens; `summary` carries
one. Rendering either without passing it through `resolveClaims()` (`lab.js:235–249`) **fails the
build**, which is the gate working correctly. The audit's estimate of *"a `div` and one line of
JS"* should be read as *a `div` and a `resolveClaims()` call* — still the highest value-to-effort
item available, but the call is not optional and a mockup that implies raw interpolation is
proposing a red build.

The wider gate scope is good news for the design work: it means the Class A patterns can be
adopted on the homepage with the token contract already enforced, rather than needing new
protection built first.

### A2 · The composition sentence this document recommends is already generated

P6 derives a two-level composition grammar from ONS — category narrowed by specific, observed
value in the same sentence, plus a null clause. The current `story` already does the first three:

> *"For the average household, housing was the largest source of financial pressure in July 2026 —
> 7 of the month's {{s:2026-07}} ounces with the 30-year mortgage at 6.67%."*

Category (`housing`), narrowed by specific (`the 30-year mortgage`), carrying both its ounces and
its observed value in one sentence. That is the ONS pattern, independently arrived at, already
passing the gate, already written to Constitution standard — **and rendered nowhere a first-time
visitor sees.**

This materially changes the framing of the phase-2 problem. The gap between 4.5/10 on EXPLANATION
and what the pipeline already produces is **not an authoring gap**. The paragraph exists and is
good. It is a rendering gap. Phase 3 mockups should be graded on whether they give this existing
sentence the right typographic rank and position (P1, P10), not on whether they invent better copy
— and any mockup that proposes new hand-written prose for this slot should be challenged, because
hand-written prose is precisely what the Constitution's §10 and the three live stale `vs2008`
numbers argue against.

The one genuinely missing piece is P6's **null clause** — "and nothing offset it" — which the
generator does not currently emit and which is what keeps a flat month from trailing off.

---

*Phase 2 of 2 · Design reference gathering · No production file was modified by this research pass.*
*Every URL in the access ledger was attempted during this pass; results are reported as they came
back, including the failures. Five phase-1 Dribbble references are cited nowhere in this document
because I could not open Dribbble.*
