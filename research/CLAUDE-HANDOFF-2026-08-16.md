# OOZEMeter Handoff — 2026-08-16

**From:** the session that unbroke the daily robot, ran the forensic audit, and
built the trust layer
**To:** whoever picks this up
**Repo:** `/Users/arringtoncopeland/Desktop/Projects/oozemeter` · branch `main`
· live at https://arringtonc.github.io/oozemeter
**Everything is pushed through `8c24707`.** Local `main` == `origin/main`.
Live site verified serving the same payload as local.

---

## Read these first, in this order

1. **Memory files** (auto-load) — `oozemeter-live-state`,
   `oozemeter-editorial-constitution`, `multi-agent-git-discipline`. The third
   is not optional; see §6.
2. `research/trust/RELEASE-READINESS.md` — what the Claim Gate does and does
   not guarantee, and the nine remaining paths by which a false claim could
   still ship. **The most important document in the repo right now.**
3. `research/forensic/00-CONSOLIDATED-VERDICT.md` — the 13-agent audit. Verdict
   NOT YET, with the P0 backlog.
4. `research/codex/D-10-CALIBRATION-DRIFT-2026-08-13.md` — the outage that
   started this session and the two-copies failure behind it.
5. `research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md` — still the most
   consequential open item. **Read §6 and do not ship it as written**; see §4.

---

## 1 · Where the product is

**Live and working:** the household jar (July 2026 = 26, methodology v3.0.0),
Ward M (24, refreshed 2026-08-16 with vintages aligned), 45+ content pages,
daily collection, four gates, a 3-critic adversarial gauntlet, and a deploy
watchdog. 33 test files.

**The gate stack, in the order the cron runs it:**

| Gate | What it refuses |
|---|---|
| `integrity.js` | implausible values, broken calibration anchors; writes `data/gate-status.json` |
| `claim-gate.js` | non-independent cross-checks, states that disagree with the payload, unregistered narrative surfaces, prose that contradicts the rows |
| `gauntlet/run.js` | 32 adversarial attacks across boundary, alias/transitive, and payload-mutation classes |
| `narrative-check.js` | bare score literals, unresolved tokens on reader surfaces, archive drift, stale indicator prose |
| `stamp.js` | refuses to stamp an integrity claim it cannot support, or a page missing any marker |
| **live-site watchdog** | publishing that never reached a reader |

**Three gates now write nothing and refuse instead.** That is the design. Expect
red builds; each one has been a real defect so far.

---

## 2 · The pattern this session, stated once

Every serious defect found was **a system confident about its own half**.

- The calibration was frozen in a *comment* while a second engine re-derived it.
- The archive was internally consistent while contradicting the jar.
- `story.js` decided a cross-check state that the gate independently re-decided.
- The robot reported successful publication while nothing had deployed for two
  days.

The fix each time was the same shape: **one source of truth, and a check that
asks whether the other side agrees.** When you add a rule, add the thing that
enforces it in the same commit, or write it down as a known gap. A rule with no
emitter is a description of an intention — this repo has now proved that seven
times.

---

## 3 · What changed this session

**Unbroke the daily robot twice.** Calibration was re-derived from live data on
every backtest run while the collector used frozen constants; they drifted apart
and the build stopped. Fixed by moving `CALIBRATION_V3` into the one module both
already import. Later, a stale feed made `story.js` and the gate disagree — fixed
by giving them one classifier.

**Removed eleven false statements** from live pages, each verified against a
primary source first. Two were direction-reversed, not merely stale: the credit
page said delinquency was "climbing steadily" through seven consecutive quarters
of decline.

**Built the trust layer.** A 215-node dependency graph where independence is
proved by traversal, not inferred from naming; a Claim Gate implementing ten
rules; 20 regression fixtures; a gauntlet ported from StockCharter.

**The gauntlet found three defects on its first run** — the gate validated the
machine-readable `state` and never looked at `label`, `count` or `note`, the
strings a reader actually reads.

**Fixed a two-day invisible outage.** `pages-build-deployment` had been failing
since 08-14 because a committed research doc contained `{{s:2026-07}}` and
Jekyll's Liquid parser choked. `.nojekyll` kills that class permanently.

---

## 4 · Open items, ranked

### Ship first

**The employment correction.** `research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md`
§6 is drafted and **must not ship as written.** Its centrepiece — *"household
employment fell 963,000 … rarest in 930 months since 1948"* — measures the
January 2026 population-control seam, not the economy. 93% of that decline
occurs in the single month containing the reweighting; ex-seam, household
employment is **+460k**. The doc's *conclusion* survives (exit is retirement and
demography, not discouragement). Its evidence does not. Rewrite around the
verified three causes in `research/forensic/04-july-2026-forensic.md`.

### Then

1. **Red-team the gauntlet further.** Three critics is not coverage. The brief's
   untested classes: aliases under two names, mismatched vintages,
   revised-vs-unrevised, cache and offline state.
2. **A test that regenerates `dependency-graph.json` from `collect.js` and fails
   on drift.** Without it every independence proof decays silently the first
   time someone adds an input.
3. **Disclose which input the housing line is using.** It switches between
   mortgage rate and delinquency by regime — 100% rate-bound 2003-07, 0% through
   2008-21, 96% today — and has never said which. Labelling fix, no version bump.
4. **Disclose the October 2025 hole.** No UNRATE, no CPI (shutdown), so the month
   is genuinely uncomputable. The gate warns; the chart still draws through it.
5. **Migrate the rest of the prose onto claim objects.** Cross-checks are
   migrated. `story`, `summary`, `confidence` and indicator copy are not.

### Operator-blocked, do not chase

Domain, business email, GA4 ID, Search Console, ESP account.

---

## 5 · Two live defects, flagged and deliberately not fixed

**`tests/weekly-package.test.js` fails.** Hermes's. It fails because the
manufacturing feed is stale and their weekly build *correctly refuses* to package
a degraded collection. Not in CI. It will pass when the feed refreshes. The real
issue is that it is coupled to live feed health, which makes it flaky by
construction — their call, not ours.

**`lab.css` orphaned declaration block (~line 174)** still swallows the `.hero`
rule; `section{padding:74px 0}` supplies hero padding by accident. Fixing it
silently changes spacing by ~74px, so it needs a design decision. `index.html`
also has zero `<h1>`.

---

## 6 · Territory — read before committing

**Never `git add -A`.** Three agents share this tree:

- **Claude** (you): page HTML, `lab.js`/`lab.css`, editorial generators,
  `scripts/claim-gate.js`, `gauntlet/`, `research/`
- **Codex:** `collect.js`, `backtest.js`, `scripts/lib/`, `tests/`, `data/*`
- **Hermes:** `.hermes/`, `reports/`, `config/`, `scripts/weekly-*`

On 2026-08-02 a blanket add swept a third party's email into a public push and
required a history rewrite. **Stage explicit paths, every time.** There is live
Hermes WIP in the tree right now (`scripts/weekly-deliver.js`,
`tests/weekly-deliver.test.js`, plus untracked `weekly-*` files). Leave it alone;
stash only those two paths when you need to rebase.

**Push:** `git fetch` → check ancestry → push. The robot commits several times a
day, so expect to rebase. Only `data/editorial.js` has ever conflicted; it is
generated, so resolve by regenerating with `node scripts/story.js`.

---

## 7 · Running the pipeline by hand

```
node scripts/collect.js          # fetches live data, writes data/
node scripts/story.js            # OOZEBOT — all prose, incl. cross-checks
node scripts/claim-gate.js       # truth states before publication
node gauntlet/run.js             # adversarial critics
node scripts/integrity.js        # plausibility + gate-status.json
node scripts/narrative-check.js  # tokens, literals, archive, indicator prose
node scripts/static-pages.js && node scripts/rss.js && node scripts/stamp.js
for f in tests/*.test.js; do node --test "$f"; done   # individually — the dir masks failures
```

**Ward M:** dispatch `market.yml` rather than running by hand — it collects under
the oozebot identity with inspectable provenance. Order matters if you must do it
manually: `collect-sectors.js` **then** `collect-market.js` (breadth reads
sectors.json).

---

## 8 · Sibling projects, newly relevant

`~/Desktop/Projects/StockCharter` and `~/Desktop/Projects/TapeShift` were brought
under git this session (they had none). StockCharter's 22-critic gauntlet is the
template `gauntlet/` was ported from and is worth mining further. TapeShift is a
narrative-change detector whose state machine maps onto The Flow — take the
shape, not its self-described "provisional unfitted" weights.

**Both are stale and neither has a heartbeat** — no cron, no workflow, no alert.
Their data stops at 2026-08-05/06 while the provider still answers. That is the
same lesson as §2, one directory over.

---

## 9 · The thing worth remembering

Adversarial review has now caught publishable falsehoods **after CI was green**,
four times. Every one was found by re-deriving a published number from files in
this repo — which is exactly what a sceptical reader does.

The answer to *"can a gate-green build still publish something false?"* is
**PROBABLY NOT, WITH KNOWN GAPS**, and the gaps are enumerated in
`RELEASE-READINESS.md`. Do not upgrade that answer without earning it. The
product's entire differentiator is that its numbers can be checked; every hour
spent making that more true is the highest-value hour available.
