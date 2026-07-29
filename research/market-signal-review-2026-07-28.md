# Market Signal Review — should the stock market enter the Ooze?

**Date:** 2026-07-28 · **Status:** review only, nothing implemented
**Method:** repo + methodology audit, primary-source economic research (2 agents), licensing verification against FRED/S&P/Cboe/Fed terms, and a shadow-model backtest over all 281 published months (baseline reproduced every published integer exactly before variants were scored).
**Artifacts:** `research/market-shadow-experiment.py`, `research/market-shadow-results.json`

---

## 1. Executive verdict

**Do not add any market weight to the flagship score — including 0.5%. Add financial conditions as a zero-weight auxiliary intake line (the architecture already has the exact slot), and build the household-vs-market divergence into the editorial layer, where it is a strength instead of a contamination.**

Three independent lines of evidence converge on this:

1. **Economics:** the top 10% of households own 87.4% of equities; the bottom 50% own 1.1% (Fed DFA, Q1 2026). The consumption channel is ~3 cents per dollar with a ~2-year lag (Chodorow-Reich et al., AER 2021). Equity signals mislead in both directions within recent memory (2020 false improvement, 2022 false stress; ~46% of postwar bear markets saw no recession).
2. **Licensing:** a direct S&P 500 input **cannot be built to OOZEMeter's provenance standards at all** — FRED carries only a rolling 10 years under an S&P DJI agreement, the series is "Copyrighted: Pre-Approval Required," and no official, redistribution-clean, free source of 2003+ history exists.
3. **The shadow backtest:** a 0.5% weight has a total dynamic range of **0.71 display points** — a full market apocalypse cannot reliably move the integer score — yet it still jitters **21% of the 281-month archive** by ±1 through rounding, and any weight (even 0.5%) forces recalibration that rewrites history and trips the integrity gate. It is invisible when it matters and noisy where it doesn't.

The genuinely valuable finding is the divergence census: markets at highs while households are stressed occurred in **57 months (~20% of the record)**; the reverse in only 2. That story is OOZEMeter's reason to exist. Blending would erase it; comparing amplifies it.

## 2. What OOZEMeter currently measures

The implemented product is a **household-pressure index**, slightly under-claimed by its own tagline.

- Every weighted input is a price, payment, or labor condition a household feels directly: employment 25 (UNRATE + ICSA claims spike), housing 20 (mortgage rate + mortgage delinquency), credit cards 20, auto 15, gas 10, inflation 10.
- The cascade (what-is-ooze.html) is explicitly a household story: "economic stress moving through a household's defenses in a fixed order: gas, credit cards, car loans, jobs, housing."
- about.html: "how much economic pressure are U.S. households experiencing … how bad is it, actually."
- But the site-wide tagline says "One score for **U.S. economic stress**" (index meta, OG tags, Dataset JSON-LD) — broader than what is measured. GDP, trade, manufacturing, and markets are not in the score (manufacturing exists only as a 0-weight aux sensor).
- The no-forecast doctrine is written in three places (about.html "measures, does not prophesy"; do-not-build list; Specimen Progress "facts only"). This matters below: **every defensible market signal is a leading indicator**, so weighting one into the flagship contradicts the doctrine.

**Recommended formal claim (one sentence):** *"OOZEMeter measures the financial pressure on U.S. households right now — one 0–100 score computed monthly from public data on jobs, housing, credit cards, auto loans, gas, and inflation."* Adopt it and tighten the tagline from "U.S. economic stress" toward "household economic stress" at the next copy pass. A market input would **broaden and blur** this claim, not strengthen it.

## 3. Assessment of the macro/micro framing

The terminology is inverted. **Microeconomics** studies individual agents — households, firms, single markets. **Macroeconomics** studies aggregates. By that standard, OOZEMeter's household ledger is the *micro-grounded* side, and the stock market is a *macro-financial aggregate*. Calling the market "Micro Ooze" would be technically wrong and would invite exactly the kind of correction the facility's credibility cannot afford (the product's stated bar is "a number a journalist can't break").

The instinct underneath the framing is sound, though: the boss has noticed that Wall Street and Main Street are different systems that sometimes disagree. The correct product expression of that instinct is a **separate, clearly-labeled market lens plus an explicit divergence comparison** — not a blended score and not "micro."

## 4. Economic research findings

(Full citations in the research brief; flags noted inline.)

- **Ownership concentration (STRONG):** Top 1% hold 50.2% of corporate equities and mutual fund shares; top 10% hold 87.4%; bottom 50% hold 1.1% (Fed Distributional Financial Accounts, Q1 2026, FRED series WFRBST01122/WFRBSN09149/WFRBSB50203). 58% of families hold *some* stock via any channel (SCF 2022 — verified via secondary reporting only, flag), 62% of adults per Gallup 2025, but only 28% of sub-$50k households. Equity prices are a poor proxy for the finances of the population the score serves.
- **Wealth effect (STRONG that it exists, small):** MPC out of stock wealth ≈ 3.2¢ per dollar per year; labor-market effects appear ~2 years after the shock, concentrated in local services (Chodorow-Reich, Nenov & Simsek, AER 2021; consistent with Poterba 2000's 3–4¢). Real, slow, top-heavy.
- **Leading-indicator value (MODERATE):** The S&P 500 is 1 of 10 Conference Board LEI components at ~3.8% weight — precedent for a small weight, **but in an index whose entire purpose is prediction**. OOZEMeter is a current-conditions gauge. The analogy argues for a *separate leading instrument*, not for contaminating a nowcast. False-positive record: ~13 postwar bear markets, ~7 recessions → roughly half of major drawdowns predicted nothing (Samuelson's "nine of the last five").
- **Divergence episodes (STRONG):** 2020 — S&P back at records by August while unemployment sat near 8.4% (CEPR attributes the rally to policy, not household conditions). 2022 — S&P −25% bear market while unemployment held at 3.5–3.7% and no recession came. One false "all clear" and one false alarm within 36 months.
- **Ranking of concepts by defensible link to household pressure:** **broad financial conditions > credit spreads > equity prices > VIX/sentiment.** The standout design is the Fed Board's **FCI-G** (mortgage rates, house prices, equities, BBB yields, policy rates, dollar — weighted by modeled GDP impulse over the *next year*). Credit spreads lead layoffs via the credit-supply channel (Gilchrist-Zakrajšek EBP literature). All of these are **leading, not contemporaneous** — a 2–12 month runway ahead of household labor stress.

## 5. Architecture findings

- **Scoring chain:** per-line piecewise-linear anchors → 0–100 stresses → weighted sum (weights total 100) → frozen linear calibration `display = round(clamp(1.4209·raw − 24.6215))` with published constants (calm 2003-25 → 10, GFC peak → 90). Integrity gate enforces GFC 90±2 and calm 10±2 and blocks the cron on violation; revisions are fingerprinted and vintaged; policies.html publicly logs methodology versions (v2.0.0 moved 244 months and is revision-record entry #1).
- **Any nonzero weight — even 0.5% — is a recalibration event.** New component ⇒ new rawCalm/rawGfc ⇒ new a/b ⇒ every archived month rescored ⇒ methodology v3, public revision-log entry, integrity invariants re-anchored. The shadow run confirms: even the recalibrated 0.5% variant changes 44 archived integers.
- **The auxiliary slot already exists and is exactly Option D:** foreclosures and manufacturing ship today as `contributesToOoze:false, scoreWeight:0, calibrationStatus:'provisional-auxiliary'` with full provenance blocks (collect.js:168-175). Adding a financial-conditions aux line is ~6 lines in the collector following that pattern, plus one INDICATORS entry in lab.js for the indicator page. The front end renders aux lines automatically: ledger AUX rows (with the provisional-sensor disclosure the test suite enforces), header score-pop, nav, footer. The featured "Intake Canisters" only draw from contributing lines, so an aux market sensor cannot sneak into the hero. Zero special-case logic.
- **Touchpoints for a weighted inclusion** (for the record, not recommended): collect.js scoring + weights, backtest.js, calibration constants, integrity.js invariants, fingerprint schema (new input), methodology docs (notes.html formula/weights), policies.html version table, narrative tokens (historical claims re-resolve automatically — one mercy of Canonical Truth), stamp.js outputs, tests. A weighted market line touches ~10 contracts; an aux line touches 2.
- **Operational note:** the licensing agent verified FRED's ToU direct automated pulls to the free-key FRED API rather than `fredgraph.csv` scraping. Production collection is the data session's domain — flagged for them, not actioned.

## 6. Evaluation of the six options

| Option | Verdict | Why |
|---|---|---|
| **A — no market weight** | Correct for the score | Preserves the claim, the archive, the doctrine. Alone, it wastes the boss's valid instinct. |
| **B — 0.5% stock weight** | **Reject** | Dynamic range 0.71 pts = sub-rounding; still jitters 21% of archive; S&P 500 fails provenance outright (no clean 2003+ source); contradicts no-forecast doctrine; ownership concentration makes it conceptually wrong for *this* score. |
| **C — small financial-conditions weight** | Reject for now | Best-in-class inputs exist (NFCI 1971+, weekly, clean licensing) and the 5% shadow shows coherent behavior — but it still rewrites 76–92% of the archive, adds a *leading* term to a *now* gauge, and changes the product claim. Revisit only with evidence (see §12). |
| **D — auxiliary only** | **Adopt** | The architecture's existing pattern; visible, honest, zero score risk; builds the observation record a future weighting decision would require. |
| **E — separate Market Ooze** | Defer | Conceptually clean but violates current discipline: no audience yet (the do-not-build logic), doubles surface area, and needs its own calibration doctrine. Earn it with the aux line first. |
| **F — hybrid (aux now + separate instrument later)** | Adopt as sequence, not simultaneity | Phase D now; E only if the aux record and audience justify it. |

Against the prompt's criteria: D dominates on defensibility, comprehensibility (the site already teaches "AUX = watched, doesn't fill the jar"), data quality (NFCI), revision behavior (aux lines don't trigger score revisions; NFCI's whole-history revisions are ±0.005-scale and ALFRED-vintaged), cadence (weekly), history (1971+), calibration (provisional, explicitly labeled), double-counting (none at weight 0 — note NFCI's 105 indicators overlap our credit/housing lines, a real double-count risk for Option C), mega-cap concentration (NFCI is not cap-weighted equity), crisis behavior (unchanged), and reader comprehension (nothing to explain away).

## 7. The 0.5% proposal, in this implementation's actual numbers

Weight 0.5 on a 0–100 stress, calibration slope a = 1.4209:

- **Maximum possible displayed effect:** 1.4209 × 0.5 = **0.71 points** — the gap between "market untouched" and "market stress 100."
- **Scenarios at the current month (household raw 36.07, displayed 27):**
  - S&P +10% (at all-time highs, stress ~5): unrounded 26.63 → **26.41 — the displayed score DROPS to 26.** Adding the market in a record bull market moves the flagship down a point by pure dilution. This is the single most damning number in the review: the component's first observable act would be to lower household-pressure readings because stocks are up.
  - S&P −10%: 26.59 → still 27 territory (26.6).
  - S&P −35% with VIX spike (stress 90): **27.01 → displays 27. A generational crash does not move the integer.**
- **Across history (281 months):** max |Δ| = 1 in every month; 59 months (21%) flip by ±1 under frozen calibration, 44 under doctrine recalibration; 4 band-label flips; **GFC 90→90, COVID 41→41, 2022 24→24 — every episode peak identical.** The component never changes any story and constantly smudges the ledger.
- **Rounding:** functionally invisible except when the unrounded score already sits within 0.71 of a boundary — i.e., its only visible behavior is coin-flip jitter.
- **Asymmetric (crash-only) variant:** would suppress the dilution artifact but introduces special-case logic into a deliberately uniform anchor architecture, and still can't clear rounding at w=0.5.
- **Threshold trigger instead:** a "market stress regime" flag is a *state*, not a weight — which is precisely the divergence feature (§9), where it belongs.

**Conclusion: 0.5% is symbolic inclusion with measurable costs and no measurable benefit.** It is not "too small to bother with" — it is small enough to be invisible *and* large enough to rewrite a fifth of the archive and force a methodology version. Worst of both worlds.

## 8. Candidate signals and sources (verified 2026-07-28)

| Candidate | Series / source | History | Cadence · lag | Revisions | Licensing | Fit |
|---|---|---|---|---|---|---|
| **NFCI / ANFCI** ★ | Chicago Fed via FRED `NFCI`/`ANFCI` | 1971+ | Weekly, Wed 8:30 ET, ~5d lag | Whole history re-estimated weekly, ±0.005-scale, ALFRED vintages | Citation-required — clean | **Best aux candidate** |
| STLFSI4 | St. Louis Fed via FRED | 1993+ | Weekly, ~5-6d | Whole-history PCA re-estimation; index redefined 3× (churn) | Fed-own, clean | Viable backup |
| VIXCLS | Cboe via FRED | 1990+ | Daily, 1d | Effectively final | Citation-required **via FRED only** (Cboe's own site prohibits redistribution) | Volatility lens only |
| T10Y3M / T10Y2Y | Treasury/Board via FRED | 1976/82+ | Daily | None | **Public domain** — cleanest of all | Narrow (curve only) |
| FCI-G | Fed Board FEDS Notes CSVs | 1990+ monthly | Monthly, 20th, ~2mo effective lag | Undocumented; **explicitly experimental, may be discontinued** | Fed publication, clean | Strongest concept, weakest operational guarantees |
| UMCSENT | U. Michigan via FRED | 1952+ | Monthly, ~2mo embargo | Final-only on FRED | Citation-required | Too stale; sentiment ≠ conditions |
| S&P 500 level | FRED `SP500` | **Rolling 10yr only** | Daily | Stable | **"Pre-Approval Required"; S&P DJI prohibits reproduction** | **Disqualified** — no official redistribution-clean 2003+ source exists (Stooq/Yahoo are unofficial, terms don't grant republication) |
| Wilshire 5000 | — | — | — | — | Removed from FRED June 2024 | Disqualified |
| HY OAS | FRED `BAMLH0A0HYM2` | **Rolling 3yr** (pre-2023 withdrawn incl. ALFRED) | Daily | Stable | ICE tightened terms | Disqualified for backfill |

★ **Recommended aux implementation:** line slug `financial`, name "Financial Conditions," source `Federal Reserve Bank of Chicago — National Financial Conditions Index (via FRED)`, weekly value, monthly-mean transform, provisional stress anchors on the NFCI scale (e.g., −0.7→5, 0→40, 1.5→85, 3→100 — GFC peaked ~2.3–2.7, COVID ~0.4, 2022 stayed *negative*), `contributesToOoze:false`, `calibrationStatus:'provisional-auxiliary'`, missing-data → STALE flag like every other line.

## 9. Historical shadow-model results

Baseline check: the experiment reproduces **all 281 published integers exactly** before any variant is applied.

| Variant | Mode | Months changed | Max Δ | Band flips | GFC | COVID | 2022 | 2023 |
|---|---|---|---|---|---|---|---|---|
| +0.5% SPX drawdown | frozen | 59 (21.0%) | 1 | 4 | 90→90 | 41→41 | 24→24 | 29→29 |
| +0.5% SPX drawdown | recal | 44 (15.7%) | 1 | 3 | 90→90 | 41→41 | 24→24 | 29→29 |
| +5% SPX drawdown | recal | 227 (80.8%) | 3 | 15 | 90→90 | 41→43 | 24→26 | 29→29 |
| +5% VIX stress | recal | 231 (82.2%) | 4 | 19 | 90→90 | 41→45 | 24→25 | 29→28 |
| +5% NFCI conditions | recal | 214 (76.2%) | 3 | 15 | 90→90 | 41→43 | 24→24 | 29→28 |

Readings:
- **No variant improves crisis identification.** GFC is pinned by calibration; COVID moves 41→43–45 only because *Wall Street* panicked — the household record (mass stimulus, deferred payments) supports the current 41, so the "improvement" is precisely the contamination critics would cite. 2022 ticks up 1–2 points on market variants during a year when unemployment sat at a 50-year low.
- **The 5% variants rewrite 76–92% of the archive** for at most ±3–4 points — methodology-v3-scale churn for no new story.
- **Divergence census** (SPX drawdown stress vs published score): market stressed while households calm — **2 months** (Jun & Sep 2022). Market at highs while households stressed — **57 months**, including the present (S&P at records; the jar reads 27 with gas at 61 and housing at 44). The asymmetry is the product insight: when they disagree, it is almost always the market being fine while households are not — the exact blind spot OOZEMeter exists to cover.
- Data caveats: SPX history via Yahoo (unofficial — research use only, another reason production can't ship an equity input); monthly-close drawdowns understate intramonth crashes (COVID monthly-close drawdown ~20% vs 34% intraday); parameters were not tuned to episodes.

## 10. Product and UI implications

Auxiliary path (recommended): the site handles everything automatically today — AUX row in the ledger with the provisional-sensor tooltip (test-enforced), header score-pop entry, nav/footer links, indicator page once an INDICATORS entry (why / vs-2008 / FAQs) is written. The canister hero cannot feature it (contributing lines only). New editorial surface worth building: **one divergence line** on the front page and in monthly reports, e.g. "Markets are calm; the jar still reads {{score}} — pressure the market doesn't price." Social cards for divergence months write themselves.

Weighted path (rejected): would require explaining to a reader why the jar moved when no household line did — the exact comprehension failure the ledger exists to prevent.

## 11. Risks and failure modes

- **Misreading the aux line as "the stock market":** NFCI is 105 indicators. Mitigate in the line's copy: "financial weather — credit, funding, and market conditions — not a stock ticker."
- **Double-counting if ever weighted:** NFCI contains mortgage and consumer-credit indicators that overlap existing lines. Any Option-C future must quantify overlap first.
- **NFCI weekly whole-history revisions** interacting with the revision detector: magnitudes are ±0.005 (verified via ALFRED vintages) — document a tolerance, don't alarm on it.
- **FCI-G discontinuation risk** if chosen instead: explicitly experimental. NFCI is the safer spine; FCI-G can inform anchors.
- **Scope creep:** the aux line must not quietly become weighted. The existing Burry gate (new lines need backtested justification) is the control; this review is the paper trail.
- **Editorial risk:** divergence copy must never imply prediction ("measures, does not prophesy") — state the divergence, not a forecast.

## 12. Final recommendation

1. **Flagship score: unchanged.** No market weight. No methodology version bump. The archive stays byte-identical.
2. **0.5% is rejected** — proven sub-rounding invisibility + archive jitter + recalibration cost + unlicensable input + doctrine conflict.
3. **If a market signal exists anywhere in the score's orbit, it is broad financial conditions, not an equity index** — NFCI as the operational series.
4. **Ship it as auxiliary** (`contributesToOoze:false, scoreWeight:0, calibrationStatus:'provisional-auxiliary'`) — the third aux sensor, alongside foreclosures and manufacturing.
5. **Separate Market Ooze: defer** to the do-not-build list with an activation condition (audience + 12 months of aux observation).
6. **Terminology:** never "Micro Ooze" (economically wrong). Internal + public name for the aux line: **"Financial Conditions."** "Wall Street vs Main Street" is editorial framing, not a product name. "Market Ooze" is reserved for the hypothetical future separate instrument.
7. **Evidence bar for any future nonzero weight (methodology v3):** ≥12 months of aux observation; demonstration in OOZEMeter's own backtest that the financial-conditions line *leads* the household composite by ≥2 quarters with a false-positive rate materially better than equity drawdowns (~46%); a quantified double-count analysis; and an explicit product decision to widen the claim from "pressure now" to "pressure now + ahead" — at which point a separate forward gauge is probably still the better answer.
8. **Smallest responsible next experiment:** extend `research/market-shadow-experiment.py` with a lead-lag study (NFCI monthly stress vs household composite at ±1–12 month offsets, 2003–2026) before even the aux line ships. One afternoon, zero production risk, and it converts the weighting question from opinion to measurement.

## 13. Phased implementation plan

- **Phase 0 (now, this review):** adopt the one-sentence claim; log the decision; lead-lag study.
- **Phase 1 (data session, ~small):** add the `financial` aux line to collect.js per the foreclosures pattern (NFCI via FRED API, monthly mean, provisional anchors, provenance block, STALE handling). Fingerprint schema gains one input.
- **Phase 2 (front-end, ~small):** INDICATORS entry (why it matters / vs-2008 / FAQs / source), Lab Notes aux-sensor paragraph, policies note (aux addition, no score change, no version bump — matching the manufacturing precedent).
- **Phase 3 (editorial):** OOZEBOT divergence sentence (categorical: markets-calm/households-pressed, both-calm, both-stressed, markets-stressed/households-resilient), Canonical-Truth tokens only.
- **Phase 4 (conditional, ≥12 months later):** revisit weighting or a separate instrument against the §12 evidence bar.

## 14. Acceptance criteria

- Every published integer in the archive is byte-identical before and after Phase 1–3 (diff on history array + latest.json ooze).
- Integrity gate passes with zero new tolerances except a documented NFCI-revision note.
- Aux line carries full provenance (publisher, transport, series ID, transform, proxy disclosure) and the provisional-auxiliary contract; public-labels tests pass unmodified.
- The indicator page states in plain language that the sensor watches financial weather and cannot fill the jar.
- Divergence copy contains no forecast language and no raw score literals (narrative-check clean).
- The claim sentence appears consistently in meta description, about, and Lab Notes.

## 15. Open questions

1. Does the boss need the word "market" on the front page, or does "Financial Conditions" + divergence editorial satisfy the underlying request? (Product/political, not technical.)
2. NFCI vs ANFCI for the aux line (ANFCI strips the economy-explained component — arguably the purer "financial weather," but harder to explain).
3. Should production collection move from `fredgraph.csv` to the keyed FRED API per FRED's ToU? (Data session's call; flagged.)
4. Lead-lag study result — does NFCI actually lead *our* household composite? (Determines whether Phase 4 is ever worth revisiting.)
5. The 58% SCF stock-participation figure and two other minor items are verified only via secondary sources (flagged in the research brief) — re-verify before any public copy cites them.

---

## Addendum (2026-07-28, same day): constrained weight study + GFC-exclusion sensitivity

Operator directed a constrained study: assume a forward-looking Financial Conditions
component enters the flagship; find the best weight in 1-10%. Results
(`weight-optimization-study.py`, `gfc-sensitivity-study.py`):

- **Among tested weights and evaluation criteria, 3% (NFCI-only) produced the best
  tradeoff** — detection benefit (GFC cross-60 one month earlier, six visibly boosted
  ramp months) turns on at 3%; interpretation holds perfectly (zero confusion months)
  through 3%; benefit saturates entirely by 5%.
- **Component design dominates weight choice:** blending VIX ("FC-fast") multiplies
  false positives ~3-5x (22 vs 8 months at 5%) for marginal detection gain. If anything
  ships, it is NFCI-only.
- **COVID early warning is unobtainable at any weight ≤10%** (Feb 2020: +0 everywhere).
- **GFC-exclusion sensitivity (the advisor's falsifier): FAILED.** Evaluated only on
  months outside 2007-2010, the component produces ZERO earlier band crossings at 1-5%,
  +0/+1 at COVID, a slightly NEGATIVE mean contribution during the 2022 tightening year
  (dilution outweighs signal), and only costs (60% churn, 7 band flips, 2 FPs at 3%).
  The single ex-GFC "benefit" (one month at the SMOOTH/STICKY line, June 2022) appears
  only at 7.5-10% and is likely recalibration artifact.

**Conclusion:** the entire measurable benefit of a weighted Financial Conditions
component lives inside 2007-2009. "3%" is therefore not a general property of the
data; it is a calibrated bet that the next household crisis is credit-driven like
2008 rather than exogenous like 2020. The decision is now explicitly a judgment
call: (a) ship 3% as methodology v3 with that disclosure stated plainly, or
(b) run the zero-weight auxiliary line first — 12+ months of live observation is
the only way to obtain the out-of-sample evidence the backtest cannot provide.

**Decision (operator + advisor, 2026-07-28): Path B adopted.** Ship the prominent
zero-weight Financial Conditions panel; flagship weights untouched.
**Reserved candidate — 3% NFCI:** in historical testing, the lowest weight that
materially advanced escalation during the 2007-2009 credit crisis without producing
unexplained score movements; benefit did not persist outside that episode, so it
remains unweighted pending live evidence. **Revisit criterion (event-based):** at
least 12 months of live aux observation AND one meaningful tightening cycle or
sustained divergence episode — calm months alone teach nothing.
