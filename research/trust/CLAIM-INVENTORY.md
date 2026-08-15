# OOZEMeter Claim Inventory

**Agent 2 — Claim Inventory Auditor.** Worktree `/private/tmp/oozemeter-claim-gate`, branch `claim-gate`, commit `82bc452`.
Machine-readable companion: [`data/claim-surfaces.json`](../../data/claim-surfaces.json) — 62 registered surfaces, 12 findings, 7 gates.
Upstream: [`research/trust/DEPENDENCY-GRAPH.md`](DEPENDENCY-GRAPH.md), [`circular.json`](circular.json) (C1–C10), [`unverifiable.json`](unverifiable.json) (U1–U19).

---

## The one-paragraph answer

OOZEMeter has **62 surfaces that make factual claims**. Two are fully validated. Thirty are validated in part. **Thirty have no program reading them for truth at all.** The gap is not evenly distributed: MEASUREMENT claims are the best-defended class on the site and NEGATIVE, INDEPENDENCE, CAUSAL and CONFIDENCE claims are defended by nothing anywhere. D1 was a NEGATIVE claim. D2 was a COMPARISON claim in an accessibility string. Both classes are still completely ungated, and this audit found **four more live falsehoods in the same families**, all of which pass CI today.

---

## 1. Gate coverage by claim class

This is the table the brief asked for. It answers "what can reach production unvalidated" in one read.

Surface counts are computed from `claim-surfaces.json` (`surfaces[].claimTypes`), not estimated.

| Claim class | Surfaces making it | Gated by | Can reach production unvalidated? |
|---|---|---|---|
| **MEASUREMENT** | 44 | integrity (numeric bounds), narrative-check (score literals, 3 corpora), release-gate (incident peaks, weights, revision figures), market-integrity | **Yes** — outside the three scanned corpora. CI-2 is live. |
| **COMPARISON** | 26 | narrative-check (archive reconstructions only) | **Yes** — CI-1 is live. |
| **METHODOLOGY** | 24 | release-gate — **string-presence tests, not truth tests** | **Yes** — CI-1 exploits exactly this. |
| **INTERPRETATION** | 22 | nothing | **Yes** |
| **NEGATIVE** | 20 | nothing | **Yes** — D1 lived here. |
| **CONFIDENCE** | 17 | stamp.js for the placard *only*, and the client overwrites it (CI-3) | **Yes** |
| **TREND** | 16 | nothing | **Yes** — U4 flat-month semantics is live. |
| **UNCERTAINTY** | 16 | public-labels.test.js — label presence only | **Partly** |
| **CAUSAL** | 14 | nothing | **Yes** — no gate class exists. |
| **FORECAST-FORWARD** | 12 | nothing | **Yes** |
| **INDEPENDENCE** | 5 | nothing in the pipeline. `scripts/lib/dependency-graph.js` can decide every one and is called by zero gates. | **Yes** — D1 lived here. |
| **CROSS-CHECK** | 3 | nothing | **Yes** — D2 lived here. |

**The shape of the hole.** Every gate the repo has answers *"is this number in range / does this string exist / do these two artifacts agree"*. Not one gate answers *"is this sentence true"*. The three claim classes that produced all three publishable falsehoods in the site's history — NEGATIVE, INDEPENDENCE, COMPARISON — sit in the "nothing" row.

---

## 2. Live falsehoods found by this audit

Four, all currently published, all passing CI. Full detail in `claim-surfaces.json#findings`.

### CI-1 — `articles.js:280` publishes a count that contradicts `articles.js:27` and `notes.html:52` for the same month

> **articles.js:280** — "at the crisis peak of June 2009 … **five of six** lines had crossed the emergency threshold."
> **articles.js:27** — "At the GFC's worst (June 2009), **six of seven** lines crossed 60."
> **notes.html:52** — "**six of seven** lines crossed 60 — autos 94, credit 90, housing 87, employment 78, Financial Conditions 69, and gas 62."

`research/backtest-results.json` for `2009-06`: employment 78.2, housing 86.7, credit 89.7, auto 93.5, gas 61.8, financial 69.1 all above 60; inflation 56.4 below. **Six of seven.** "Five of six" was correct under methodology v2, before Financial Conditions entered the formula. It is now false, on a public explainer page, beside a token that resolves correctly.

**Why it survived — and this is the sharp part.** `release-gate.js` already knows `"five of six"` is a stale-v2 tell and **bans it by name**:

```js
if(/\ball six lines\b/i.test(notes)||/five of six/i.test(notes)||!/six of seven/i.test(notes))   // notes.html
if(!/all seven weighted lines/i.test(articles)||!/six of seven/i.test(articles)||…)              // articles.js
```

The ban is applied to `notes.html`. For `articles.js` the gate only requires that `six of seven` appear *somewhere* — it appears at line 27, so the gate is green while the banned phrase sits 253 lines below in the same file. **The gate proves a true sentence exists. It cannot prove a false one does not.** That is the general failure mode of every methodology check in `release-gate.js`, and here the repo had already written the correct assertion and pointed it at one of the two files that needed it.

### CI-2 — `archive.html` publishes a score literal that is wrong by 8 points, on a surface the score-literal ban never opens

> **archive.html:140** — "Everyone hated this economy — but jobs were plentiful and bills got paid, so the jar **read just 27**."

`data/history.json` for `2022-06` is **19**. The highest reading anywhere in 2022 is 24. There is no month in the record that reads 27.

**Why it survived.** The narrative gate's own `CLAIM` regex matches `read just 27` — this is precisely the pattern the score-literal ban was written to catch. But `narrative-check.js:105-113` scans `articles.js`, `data/auto-articles.js` and `data/reconstruction-reports.js`, and never opens `archive.html`, which carries its own inline `EV[]` array of event prose rendered through `resolveClaims()` into `#epDesc` on every event click. `archive.html:132` carries a second literal ("climbs to 90", currently true) with the same exposure — one revision away from being the next CI-2.

### CI-3 — `index.html` overwrites the gate-derived integrity placard with a hardcoded PASS

> **index.html:239** — `$('plcSealed').textContent='Integrity gate: PASS · fails closed';`

`scripts/stamp.js:18-37` exists specifically because this claim was once a string literal. Its comment says so:

> *"The placard used to assert 'Integrity gate: PASS · fails closed' as a string literal, so a gate that failed, a gate that never ran, and a gate that passed all produced the same sentence on the page."*

stamp.js now reads `data/gate-status.json`, refuses to stamp when `status !== 'pass'` or the verdict month is stale, and appends `· N warnings`. **The client discards all of it on every page load.** A no-JS reader sees the honest placard; a JS reader — which is every reader — sees the literal, with the warnings disclosure silently dropped.

### CI-8 — a screen-reader label contradicts the sighted copy on the same chart

> **lab.js:340** — `aria-label="20-year stress history chart"`
> **archive.html:31** and **tests/public-labels.test.js:32** — "**23 years** of measured U.S. economic stress"

A blind reader is told a different span than a sighted reader, and the test suite enforces only the sighted one. It also drifts by a further year every January. This is the D2 pattern exactly: *the false string survives longest where a sighted proofreader never looks.*

---

## 3. NEGATIVE and INDEPENDENCE claims — the D1 class, enumerated

The brief asked for special attention here. Fourteen published sentences, in eight files, all enforced by comments and none by programs.

| Sentence | Where | Decidable by graph today? | Gated |
|---|---|---|---|
| "Cross-check series carry no score weight. This does not change the reading of *N*." | `index.html:94` (static markup, every visit) | Yes — `upstreamRawSeries` on every published pair | **No** |
| "The jar reads X. **It does not read Y.**" | `story.js:202` → `index.html#ccBody` | Yes — this is the literal D1 sentence | **No** |
| "…published by *P* and **carrying no score weight**…" | `story.js:196,201` | Yes | **No** |
| "(Auxiliary sensor — observed, but **carries no score weight**.)" | `story.js:67` → indicator pages, articles | Yes | **No** |
| "**The S&P 500 is not an input to the Ooze Score at any weight.**" | `lab.js:112` financial FAQ | Yes | **No** |
| "markets get their own separate instrument in Ward M, **which never touches this score**" | `lab.js:112` | Yes | **No** |
| "this auxiliary file has **zero additional weight**" / "it **does not add separate weight** to the Ooze because mortgage delinquency already informs Housing" | `lab.js:120,122` | Yes — and note this states the D1 fact **correctly**, while the cross-check module stated it **incorrectly**. Two surfaces, one fact, no shared source of truth. | **No** |
| "**This gauge does not affect the household Ooze Score.**" | `market-pages.js` → 5 of 6 gauge pages | Yes | **No** |
| "It is the **only input the two instruments have in common**" | `market-pages.js` → `market/credit/` | Yes — `sharedRawSeries` | **No** |
| "The two instruments are **never averaged**, and they **overlap in exactly one place**" | `market.html:79` | Yes | **No** |
| "**Nothing here changes the Ooze Score.**" / "**does not fill the household jar**" | `market.html:78,42` | Yes | **No** |
| "It **never adds to or subtracts from** the Ooze Score" / "contribute **nothing** to the score" | `notes.html:54` | Yes | **No** |
| "**Never met** in the comparable record since 2003" (OOZEMAXING) | `notes.html:52`, `what-is-ooze.html:45`, `articles.js:26,34,280,373` — six surfaces | Yes — and `data/latest.json` **already carries an `oozemaxing` boolean** the collector computes and no surface reads | **No** |
| "**No fake numbers, ever.**" | `about.html:44` | No — but contradicted in practice by `personal.html` (CI-9) | **No** |
| "PROVISIONAL AUXILIARY SENSOR · 0-WEIGHT · **DOES NOT ALTER THE OOZE SCORE**" | `index.html:356` tooltip | Partly — driven by `contributesToOoze`, a collector flag, not the graph | Label presence only |

**The governing defect.** `scripts/story.js:118-123` states the pair-legality rule as a comment ending: *"Every pair added here must be verified absent from `scripts/collect.js` first."* That is a human instruction in a file a robot runs unattended every morning. `scripts/lib/dependency-graph.js` answers the same question in one call, passes 11 tests, and **is wired into zero gates**. It is a test, not a gate.

**And note the standing counter-example (graph C8/U16).** A disjointness PASS must not be rendered as "independent" in reader prose. Ward M energy (WTI) and household gas (retail gasoline) are graph-disjoint and economically parent-and-child. `market.html` already uses the correct phrasing — *"the only **input** the two instruments have in common"* — and that phrasing is the standard the gate should enforce, not "independent".

---

## 4. `data/editorial.json` — the exempt surface

The brief flagged this specifically. The exemption at `narrative-check.js:209` is **correct**: `editorial.json` is a token *carrier* by design and its consumers resolve. But three individually-correct rules combine into a pre-staged failure:

1. `release-gate.js:62` **requires** `editorial.newsletter` to contain the raw literal `${score}/100`.
2. `narrative-check.js` **bans** raw score literals in article prose.
3. `narrative-check.js:209` **exempts** `editorial.json` from the token-leak scan.

The live `editorial.newsletter` therefore contains **both** a baked literal (`OOZE LEVEL: 26/100`) **and** an unresolved token (`{{s:2026-07}}`) in the same string. A repo-wide grep finds **no consumer of `editorial.newsletter` or `editorial.social` anywhere** — and wiring the Buttondown path is an open task (`flowmap.html:1119`). Whoever completes it ships either a stale literal or a raw `{{token}}` to every subscriber. That is the identical failure that reached RSS subscribers on 2026-08-14, sitting loaded in a second field. (`editorial.social` is worse and smaller: a baked `26/100` with no token and no consumer at all.)

**editorial.json is also a public artifact**, linked from `about.html` as "the raw output, one click away". Its cross-check block publishes the D1-class NEGATIVE claims quoted above directly to any reader who opens it, with no scan of any kind.

---

## 5. Surface census

Full records with source data, derivation, validation rule and public surfaces are in `data/claim-surfaces.json#surfaces`. Summary:

### Generated daily (in the cron)
`data/latest.json` · `data/latest.js` · `data/history.json` · `data/editorial.json` (15 claim fields) · `data/editorial.js` · `data/auto-articles.js` · `data/gate-status.json` · `data/revisions.json` · `feed.xml` · `index.html` static furniture · `market.html` static furniture *(written, never committed — CI-7)* · `data/market-history.json`

### Generated by hand, published anyway
`data/reconstruction-reports.js` (23 reports — **the one fully-gated prose surface**) · `<slug>/index.html` ×9 · `files/<slug>/index.html` ×44 · `sitemap.xml` · `market/<gauge>/index.html` ×6 · `research/lessons/*.html` ×6 · `og-card.png` + `og-cards/*.png` ×10 · `data/market.json` · `data/sectors.json` · `research/market-anchor-validation.md`

**None of these are in `.github/workflows/collect.yml`.** Every baked figure on 59 indexed pages and 10 share images goes stale silently between manual runs, on URLs the sitemap actively asks Google to crawl.

### Hand-written prose, publicly rendered
`articles.js` (20 articles: 34 causal constructions, 16 forward-looking, 37 negative — none checked) · `lab.js` INDICATORS ×9 · `lab.js` EVENTS · `lab.js` INCIDENTS · `lab.js` STATES · `lab.js` WEIGHTS/BANDS · `notes.html` · `what-is-ooze.html` · `about.html` · `policies.html` · `market.html` · `archive.html` · `states.html` · `personal.html` · `terms.html` · `privacy.html` · `specimen-progress.html` · `oozeonomics.html` · `404.html` · `scripts/lib/market-gauge-content.js` (6 gauges × 9 fields) · `scripts/market-pages.js` inline prose · `research/reference/intake-data-map.html`

### Accessibility strings and tooltips (the D2 neighbourhood)
`index.html` jar `aria-label` (stamped + runtime) · `#ozBar` `aria-label` · **cross-check gutter `sr-only` ×2** (canCards + roster — *this is where D2 lived*) · AUX row `title` attribute · `lab.js` chart `aria-label` (**CI-8, false**) · `market.html` jar and divergence-chart `aria-label`s · `market-pages.js` gauge `aria-label` · Sector Watch per-ticker `aria-label` · `lab.js` FEED_TITLE tooltip

### Share and distribution
`og-card.png` + 10 per-page cards · homepage copy-report clipboard text · Twitter intent text · `personal.html` clipboard text · `feed.xml` · `.weekly/*/discord.txt` · `.weekly/*/email.txt` · `editorial.newsletter` (unwired) · `editorial.social` (unwired)

---

## 6. What the repo already does right, and should copy

Three patterns exist and each was applied to exactly one place:

1. **`data/reconstruction-reports.js`** — a generator that re-derives every figure, plus a gate (`narrative-check.js:122-164`) that reconciles the printed number against the canonical artifact and fails on drift. This is the only prose surface on the site with `gated: "full"`. It became that way on 2026-08-14, after five of eleven reports had silently drifted a point.
2. **`lab.js` INCIDENTS `peak`** — recomputed from `data/history.json` by `release-gate.js:132-141`, fails on drift. **`lab.js` EVENTS sits eight lines above it** with five hand-typed historical measurements and no check (CI-10).
3. **`scripts/lib/weekly-brief.js` `renderEmail`** — prints each gate's *actual* pass/blocked/FAIL result from execution rather than asserting PASS. This is exactly what `index.html:239` (CI-3) and `editorial.confidence` (U10) should do and do not.

`policies.html` deserves a mention too: it is the only hand-written page whose figures are checked against a canonical artifact (`data/revisions.json`) rather than asserted.

---

## 7. Blocking prerequisites carried forward

From the graph agent, unchanged and still blocking — a claim validator cannot enforce cross-check condition (c) or U2/U3 until `scripts/collect.js` emits, per line:

- `deltaFromMonth` / `deltaToMonth` — the month pair the delta spans
- `stressMonth` — distinct from the display `asOf`
- `driver` + `branches` on the two `Math.max` lines (`jobs`, `housing`)

Confirmed live from the payload: `jobs.delta` spans `2026-06 → 2026-07`; `manufacturing.delta` spans `2026-05 → 2026-06` (INDPRO's own newest pair, `asOf 2026-06-01`). The published sentence **"Over the same month"** is false right now (U1/D3).

Add one from this audit: **`oozemaxing`** is already computed and published in `data/latest.json` (currently `false`) and read by no surface, while six surfaces assert the historical negative "never met in the comparable record". Wiring the existing boolean is cheaper than the claim it would defend.

---

## 8. Recommended gate order

1. **Widen the corpus, don't invent a gate.** `narrative-check.js` already has the score-literal ban, the token resolver and the definitional allowlist. Point them at every reader surface in `claim-surfaces.json`. That alone kills CI-2 and would have killed the 2026-08-14 archive drift a cycle earlier.
2. **Cross-corpus consistency, not presence.** Replace `release-gate.js`'s `/six of seven/i.test(articles)` with: extract every `N of M` claim about a named month, resolve `M` against the weighted-line count for that month's methodology version, fail on disagreement. Kills CI-1.
3. **Wire the graph into `story.js` as a precondition.** `CC_PAIRS` must be validated by `sharedRawSeries` + zero-weight + same-month-pair before a single cross-check sentence is emitted, and the emitted sentence must carry the trail `pathBetween` returned. A gate that says "related" without saying *how* gets argued with. Closes the D1 class permanently.
4. **CONFIDENCE claims must derive, never assert.** Delete `index.html:239`; make `editorial.confidence` read `data/gate-status.json` the way `renderEmail` does. Add a test that fails on any literal `Integrity gate: PASS` outside `gate-status.json`.
5. **Register accessibility strings.** Every `aria-label` and `sr-only` that contains a number or a verdict word goes through the same resolver and the same scan as visible copy. D2 and CI-8 both lived there.
6. **Fail the build when a publish script writes a file the workflow does not commit** (CI-7), and when a generator listed in `claim-surfaces.json` has not run since the artifact it reads changed (static-pages, og-cards).

---

## 9. Scope discipline

Nothing was modified. `git status` shows additions only. Out-of-scope items were inventoried and explicitly flagged `scopeNote: "OUT OF SCOPE"` rather than fixed: `lab.js` STATES, `states.html`, `personal.html` (Personal Ooze / state model), `lab.css:~174` orphan block, hero spacing, missing `h1`. Flat-month semantics (U4) is in scope per the brief and is recorded against `editorial.lines`; the fix remains one line — `moveClass` must consult `line.updateStatus`, which `collect.js:193` already computes.

No gate, test or threshold was weakened, loosened or deleted.
