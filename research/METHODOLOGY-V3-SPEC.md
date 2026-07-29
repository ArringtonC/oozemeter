# Methodology v3.0.0 Specification — Financial Conditions enters the flagship at 3%

**Status:** operator-approved 2026-07-28 (Path A). **For: the data session** (owns
collect.js / backtest.js / integrity.js / tests). Front-end + editorial pieces are
listed at the end and will be done by the front-end session after this ships.

**Decision record:** `research/market-signal-review-2026-07-28.md` (+ addendum) and
four study scripts (`market-shadow-experiment.py`, `leadlag-study.py`,
`weight-optimization-study.py`, `gfc-sensitivity-study.py`). Summary of what this
change is, stated honestly: 3% NFCI is the lowest weight at which the score
escalates measurably earlier in a 2008-style credit crisis (cross-60 one month
earlier, six visibly boosted ramp months) with zero unexplained score movements.
The benefit does not appear outside 2007-2009 (GFC-exclusion sensitivity failed);
this is a deliberate product bet on credit-driven crises, and all public copy
must say so. It buys nothing in fast shocks (Feb 2020: +0 at every weight).

## 1. New input

- **Series:** NFCI — Chicago Fed National Financial Conditions Index.
- **Transport:** FRED (`NFCI`), weekly, Wednesdays 8:30 ET covering through prior
  Friday. Prefer the keyed FRED API per FRED ToU; `fredgraph.csv` as documented
  fallback. Full history 1971+; keyless verified 2026-07-28.
- **Transform:** calendar-month mean of weekly observations (same style as GASREGW).
- **Revisions:** Chicago Fed re-estimates the ENTIRE history weekly; observed
  magnitude ±0.005 (verified via keyless ALFRED vintages, e.g. 2008-10-10 peak
  2.32017 → 2.324 across Jan→Jul 2026 vintages). The revision detector needs a
  documented tolerance for this series (suggest: |Δ| ≤ 0.02 per historical month
  = expected churn, no alarm; larger = flag). Do NOT treat routine NFCI history
  drift as a data-integrity event.
- **Provenance block:**
  `source:{publisher:'Federal Reserve Bank of Chicago',transport:'FRED',seriesId:'NFCI',metric:'National Financial Conditions Index, monthly mean of weekly values',url:fred('NFCI'),transform:'calendar-month mean'}`

## 2. Stress anchors (piecewise-linear, same interp as all lines)

```
financialConditions: [[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]
```
Reference points: GFC peak monthly mean ≈ 2.3-2.7 → ~93-98; COVID Apr 2020 ≈ 0.4
→ ~58; 2022 stayed negative (≈ -0.1 to -0.35) → ~25-35; long calm ≈ -0.55 → ~13.
These are the anchors used in all four studies; changing them invalidates the
evidence base — if you must adjust, re-run `weight-optimization-study.py`.

## 3. Weights (v3)

| Line | v2 | v3 |
|---|---|---|
| employment | 25 | 24.25 |
| housing | 20 | 19.40 |
| credit | 20 | 19.40 |
| auto | 15 | 14.55 |
| gas | 10 | 9.70 |
| inflation | 10 | 9.70 |
| **financial** | — | **3.00** |
| total | 100 | 100.00 |

Incumbents scale pro-rata (×0.97) — no line singled out. Weights are published;
notes.html display comes from lab.js WEIGHTS (front-end will sync).

## 4. Recalibration (doctrine unchanged)

Re-derive on the v3 raw series over the frozen window: calmest 2003-2025 month
→ 10, GFC (2007-01..2010-12) peak → 90. Expected from the study (Python
replication): roughly a≈1.436, b≈-25.1 — the JS pipeline's own constants are
authoritative; freeze whatever backtest.js prints. Expected archive effect:
**~64% of the 281 published integers change, all by ≤2 points; ~9 band-label
flips; episode peaks GFC 90, COVID ≈41-42, 2022 ≈24.** If your run differs
materially from these figures, stop and compare against
`research/weight-optimization-results.json` (w=3 row) before publishing.

## 5. Integrity gate

- Re-anchor invariants to the new constants (GFC 90±2, calm 10±2 — unchanged rule).
- Plausibility range for the new line: NFCI monthly mean in [-1.5, 4] (history:
  min ≈ -0.99, max ≈ 2.7); 30-pt stress jump cap applies as usual.
- Missing/stale NFCI: same STALE-flag behavior as other lines; if the feed dies,
  the line goes stale visibly — never silently carry the last value beyond the
  staleness window.

## 6. Fingerprint / vintage / revision record

- Add NFCI to the input fingerprint schema (bump fingerprintSchemaVersion).
- `methodologyVersion: '3.0.0'`.
- Revision record entry #2 (public, policies.html — front-end will render; you
  produce the numbers): count of months moved ≥1, max move, calibration constants
  old→new. Entry #1 (v2.0.0, 244 months) is the precedent and format.

## 7. latest.json contract

New line `financial` in `lines`: value = monthly-mean NFCI (2 decimals, e.g.
"-0.54"), stress, contrib (= round(3.0 × stress / 100 × a)? — NO: follow the
existing contrib convention exactly as other lines compute theirs), delta,
asOf, cadence:'weekly', `contributesToOoze: true`, source block per §1.
Front-end renders it automatically in ledger/canisters/score-pop once present.

## 8. Tests

- Extend methodology tests: anchors interp spot-checks for financialConditions;
  monthly-mean transform; weights sum to 100.
- Golden expectations: after recalibration, assert GFC peak 90±2, calm 10±2,
  COVID peak 41±2 (it may legitimately print 42).
- public-labels test: financial is a WEIGHTED line (not aux) — no AUX labeling.

## 9. Rollout order

1. backtest.js: add series + anchors + weights → run → compare episode peaks and
   churn against §4 expectations → freeze printed constants.
2. collect.js: new line + scoring + calibration constants + fingerprint bump.
3. integrity.js: re-anchored invariants + NFCI plausibility + revision tolerance.
4. Tests green. 5. One manual collection run end-to-end locally. 6. Commit with
   the archive rewrite + updated data/history.json in the SAME commit (no
   split-brain between history and methodology). 7. Tell the front-end session —
   it takes over the public-facing pieces below.

## 10. Front-end + editorial pieces (front-end session, after data lands)

- lab.js: WEIGHTS → 7 entries (v3 values); INDICATORS entry for `financial`
  (name "Financial Conditions", emoji 🏦? — pick non-colliding; why-it-matters /
  vs-2008 / FAQs copy; source).
- notes.html: formula + weights update + the v3 explanation.
- policies.html: methodology v3.0.0 history row + revision record entry #2.
- **Mandatory disclosure copy (non-negotiable, honesty rules):** the methodology
  note must state plainly: (a) the component is calibrated to credit-driven
  crises and its measured benefit comes from a single historical episode
  (2007-2009); (b) it detects slow credit tightening ~1-2 months earlier and
  contributes nothing in fast shocks; (c) in calm markets its arithmetic effect
  on the blended score is slightly negative (dilution); (d) the full studies are
  public in research/. Draft: "In v3 the jar gained a seventh intake line:
  Financial Conditions (3%), the Chicago Fed's 105-indicator NFCI. It is a bet,
  labeled as one: in backtesting it made the score climb about a month earlier
  in the slow credit tightening of 2007-08, and did nothing in the fast crash of
  2020. We weighted it at 3% because that is the smallest weight where the
  early-warning effect is visible and the largest where every score movement
  still has a household explanation."
- OOZEBOT: line narrative for `financial` (story.js template), divergence
  sentence stays valuable and ships alongside.
- stamp.js/site: no structural change (score flows through existing markers).

## 11. Acceptance criteria

- Weights sum 100; all tests green; integrity gate passes on the new anchors.
- Published revision entry #2 with exact counts; archive + methodology change in
  one commit.
- Every public number still traces to a cited source; NFCI cited "Federal
  Reserve Bank of Chicago via FRED."
- Disclosure copy §10(c-d) present before the first v3 cron publish.
