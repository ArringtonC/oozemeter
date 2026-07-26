# OOZEMeter Product Refinement Audit — v1 (2026-07-26)

Charter: current implementation is correct; tasks.js is authoritative; find only
high-leverage omissions; reject duplicates; rank by impact per unit effort.
Method: four board personas, max 2 findings each, duplicates against the ledger
and the 9 logged deltas forbidden. All 8 findings survived the filter.

## Findings, ranked by impact-per-effort

| # | Finding | Owner | Effort | Impact | Why it made the cut |
|---|---|---|---|---|---|
| 1 | Silent history-rewrite detector + calibration invariants (diff new history vs old at collection; assert GFC=90/calm=10 every run; fail closed) | Burry | S | 5 | A BLS revision could silently make published claims false — the site must catch its own number changing before a reader does |
| 2 | Historical verdict line on the hero ("Calmer than 8 of every 10 months since 2003") | Jobs | S | 5 | A normal person can't grade "25"; one computed sentence converts mystery into verdict — the five-second promise finally completes |
| 3 | Plausibility gate: per-series range + jump limits before publish (unemployment 0–30%, gas $1–8; violation → keep prior snapshot, open issue) | Burry | S | 4 | The one overnight-fatal failure mode: confidently publishing a plausible wrong number from a shifted workbook column |
| 4 | Stamp the real score into static HTML at collection time (title, meta, hero, share card — crawlers currently see the fake 67) | Jobs | S | 4 | Every SERP snippet and no-JS render contradicts our own trust doctrine today; the cron already rewrites files daily |
| 5 | RSS/Atom feed emitted by the cron | Zuckerberg | S | 4 | Three loops in one small script: aggregator discovery, crawler pings, and Buttondown RSS-to-email makes the planned newsletter nearly free to run |
| 6 | Motion + type tokens (settle curve declared once — currently pasted in 4 places among 11 ad-hoc durations; fix synthesized faux-bold in readings rail) | Ive | S | 3 | Drift multiplies when the v4 content engine starts stamping pages; cheapest moment to tokenize is now |
| 7 | JSON-LD structured data incl. Dataset schema for the score itself | Zuckerberg | S | 3 | AI answer engines cite what they can parse; extends the Tryst schema transplant with Article + Dataset |
| 8 | First-paint doctrine: static shell + self-hosted/preloaded fonts (LCP <2.0s, CLS <0.05; score visible before JS) | Ive | M | 4 | Pages are a black void until 3 scripts + Google Fonts resolve; every future page inherits whatever first paint ships now |

## The 9 deltas (logged separately, from the ChatGPT-prompt distillation)
80/20 language audit · data-release calendar · why-it-changed sections · formula
version history · editorial/correction policy · prev/next file nav ·
ad-readiness gate · do-not-build-yet list · measurement-before-expansion rule.

## Standing law adopted
**Measurement before expansion:** every new section ships with its metric, its
target, and its removal condition — or it doesn't ship.
