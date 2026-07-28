# OOZEMeter Handoff — Front-End / Editorial Session (2026-07-28)

**From:** the primary front-end/editorial Claude session (context being cleared)
**To:** the next session picking up this work
**Repo:** `/Users/arringtoncopeland/Desktop/Projects/oozemeter` · branch `main` · live at https://arringtonc.github.io/oozemeter

## Read these first
1. `research/CLAUDE-HANDOFF-2026-07-25.md` — the data session's handoff (methodology, /teach lessons)
2. `research/publication-review-2026-07-27.md` — the 3-agent editorial review + Burry cold-visit verdict
3. `research/refinement-audit-v1.md`, `research/editorial-qa.md`, `research/do-not-build.md`
4. `tasks.js` — THE task ledger (source of truth, renders in flowmap.html Tasks tab)
5. Memory file `oozemeter-live-state` has working agreements (honesty rules, fun protection, humanize language, push-only-on-request)

## THE IMMEDIATE NEXT TASK (operator-approved, ready to execute)
**Fold prototype Variant J ("final form") into the real `index.html`.**
- `prototype-frontpage.html?variant=J` is the approved design: Mission Control (left ~70%: hero score + jar + placard column Collected/Verified/Sealed-Integrity% + 4 featured Intake Canister cards + split two-panel Ledger + "Can I verify it?" row) × Research Library rail (right: LATEST FILE framed card w/ button + mini-jar thumbnail, RECENT FILES cards with color-coded tag dots, tag legend, LEARN MORE ABOUT OOZE shelf).
- It was built from a ChatGPT design mock the operator loved, re-implemented with CANONICAL NUMBERS (mock's numbers were fabricated — gas is really 61, unemployment 14, etc.).
- Rejected along the way (do not resurrect): bar-gauge ledger (operator: "terrible"), placard-under-jar, conduit pipes/bubbling canisters (advisor loved, operator reverted), story-first hero (variant B).
- At fold time: preserve boot sequence + cascade of existing index.html behaviors (nodes/pipes hero may be REPLACED by J's canister design — confirm with operator whether the old pressure-node hero survives anywhere, e.g. "VIEW ALL INTAKE LINES →" currently points at old index), propagate the NEW TAG TAXONOMY site-wide: SPECIMEN REPORT→"OOZE MONTHLY REPORT", INCIDENT FILE→"OOZE ARCHIVES", OOZEONOMICS 101/FIELD MANUAL→"OOZEONOMICS" (update oozeonomics.html, article.html CATS, rss/story if labels appear).
- Then move prototype-frontpage.html to a throwaway branch per the /prototype skill (committed on main right now so it isn't lost).
- **After the fold: update flowmap.html** (operator explicitly queued this) — roadmap nodes, tasks tab auto-updates, % complete, mark front-page work done, Rev bump.

## State of the world
- **Live site**: deployed 2026-07-25; daily cron ("daily-collection") self-commits as `oozebot` — ALWAYS `git pull --rebase` before pushing. Live site is ~40 commits behind local main (operator pushes only on explicit "push it").
- **Local main (committed)**: OOZEBOT editorial engine (scripts/story.js — protected editorial voice, see editorial-qa.md voice rules + 5 protected signature phrases), Canonical Truth (prose tokens {{s:YYYY-MM}}/{{peak:A..B}} resolved from history; scripts/narrative-check.js fails the cron on raw score literals), integrity gate (scripts/integrity.js), stamper+RSS+story wired into workflow, Oozeonomics wing (articles.js + auto-articles), specimen-progress.html, policies.html (methodology v1/v2 history), what-is-ooze.html, per-line mini jars in hero nodes + header chip panel.
- **Parallel data session**: still active in scripts/collect.js, workflow, tests/, scripts/lib/ (fingerprint.js, fred.js uncommitted). DO NOT edit those files; it commits its own batches. Current reading: June 2026 = 27 (methodology v2.0.0).
- **Uncommitted right now**: the data session's files (leave alone) + macOS .DS_Store junk (ignorable).

## Hard-won process rules (violate at your peril)
1. **Every python patch asserts its anchor** — two half-applied patches shipped broken pages this session; the operator judged a "terrible" design that was actually missing its CSS.
2. **After patch batches, run the orphan-class check** (markup classes with no CSS = fail): pattern exists in the last session commands.
3. Verify inline JS with `node --check` on extracted scripts for every touched page.
4. Canonical Truth: no number is ever written into prose/UI copy — tokens or data lookups only; narrative-check.js enforces articles.
5. The operator's wife is an active design reviewer with good instincts ("smushed", "unclear rail") — her feedback is taken seriously.
6. Advisor texts (ChatGPT) arrive frequently; triage against the ledger — typically ~70% already done, extract only deltas.

## Key numbers (as of 2026-07-27, methodology v2.0.0)
June 2026 = 27 (Sticky), May = 30. Verdict: "Calmer than 6 of every 10 months since 2003." Line stresses: gas 61, housing 44, inflation 33, credit 38→? (check latest.json), auto ~44, jobs 14. GFC peak Jun-2009 = 90 (calibration peg), calm floor = 10, 2022 peak = 24, COVID peak = 41. Oct 2025 = data gap (shutdown), rendered as visible break.

## Queue after the fold (in rough priority)
1. flowmap.html update (operator-queued)
2. Push (only when operator says "push it")
3. Season-2 ledger items: GA4/track.js port from Tryst, Search Console, static per-slug pages, real ESP newsletter, OG images/favicon (Jar SVG master), first-paint (AUDIT-8)
4. Ooze Audio (logged v5), state pages, per-line backfill
