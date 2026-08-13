# OOZEMeter Handoff — 2026-08-12

**From:** the Claude session that ran the board reviews, locked the Editorial
Constitution, and investigated the boss's critique
**To:** whoever picks this up
**Repo:** `/Users/arringtoncopeland/Desktop/Projects/oozemeter` · branch `main`
· live at https://arringtonc.github.io/oozemeter
**Everything is pushed through `e28f653`.** Local `main` == `origin/main`.

---

## Read these first, in this order

1. **Memory files** (auto-load) — `oozemeter-live-state`, `oozemeter-editorial-constitution`,
   `multi-agent-git-discipline`. The third one is not optional; see §7.
2. `research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md` — **LOCKED v1.0.** The
   robot expresses this voice; it never edits it.
3. `research/editorial/EDITION-STYLE-GUIDE.md` — frozen v1. The reader journey and
   section order every edition follows.
4. `research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md` — the most consequential
   open item. Read §6, the draft correction; it is ready to ship.
5. `research/codex/CODEX-DIRECTION-2026-08-04.md` — D-0 … D-9, the pipeline blockers.
6. `research/hermes/MESSAGE-TO-HERMES-2026-08-11.md` — the emitter spec Hermes needs.

---

## 1 · Where the product actually is

**Live and working:** the household jar (June 2026 = 26, methodology v3.0.0),
Ward M (27 after the Aug 11 refresh), 45+ content pages, daily oozebot collection,
integrity gates, a narrative-truth gate, public corrections, privacy/terms.

**Three gates, from the roadmap:**

- **Gate 1 — Editorial: PASS.** Constitution locked, identity established,
  corrections policy exercised three times in public.
- **Gate 2 — Engineering: FAIL.** The evidence packet exists and is good; the
  validators do not enforce the Constitution; failing gates do not block.
- **Gate 3 — Publication: FAIL.** No edition has passed a real validator.

**The automation gate is shut and should stay shut.** No weekly send is automated
— `scripts/weekly-deliver.js` exists but **no workflow calls it**, and no send has
ever been recorded. That is deliberate.

---

## 2 · The project's signature failure — know this pattern

**We write the rule and never build the emitter.** It has now happened five times:

| Rule written | Emitter missing | Caught by |
|---|---|---|
| §4 byline mandatory | absent from 23/23 archive reports | corpus review |
| §15 corrections block | nothing emits it | research triage |
| §3 intensifier ban | no engine checked; 3 were live on published pages | research triage |
| Style guide frozen | nothing in the pipeline reads it | operator noticed |
| §10 confidence statement | hand-written each time | adversarial review |

**When you write a rule, build the thing that emits it in the same commit, or put
it in §16 with a blocker and an owner.** A rule with no emitter is a description
of an aspiration.

---

## 3 · The immediate queue

### Ship this week (highest value, zero risk)

**The employment correction.** `research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md`
§6 contains a draft ready to publish. It needs no version bump, no backtest, no
recalibration. It is the product's differentiator doing exactly what it exists to
do — an outside expert caught something our own checks missed, and we say so.

**Context you need before touching it:** the operator's boss (a domain expert)
pointed out that the jar scored July as improvement while payrolls fell 23,000.
He is right that the employment line cannot see labor-force exit, and right that
it corrupted the 2007 backtest. **But the obvious "fix" is wrong** — prime-age
participation is exactly flat (83.5 → 83.4), the entire decline is 55+ retirement
plus slowing population growth, and every household-distress measure is quiet.
Publishing "people gave up looking" would have been an unsourced causal claim.
**Do not soften the correction into that story.** The investigation verified all
of this against FRED; the numbers are in the doc.

### Then, in order

1. **Codex: D-0** (no pipeline path to publish a correction), **D-3** (deltas
   computed against a file the collector overwrites), **D-4** (`validation.json`
   structurally cannot report non-blocking failures), **D-9** (the packet names
   the wrong input for jobs and housing — `Math.max()` over two series, first
   candidate printed).
2. **Hermes:** the emitter spec in `MESSAGE-TO-HERMES-2026-08-11.md`, and the
   test email the operator has asked for twice and not received.
3. **Design phase 2:** four mockup directions, gated on operator veto of
   `mockups/inspiration-board.html`. **Do not build these until he responds** —
   phase 1 exists precisely so he can veto before mockups calcify.

### Operator-blocked, do not chase

Domain purchase, business email, GA4 measurement ID, Search Console, ESP account.
Every analytics-dependent goal waits on the GA4 ID.

---

## 4 · Two live defects, flagged and deliberately not fixed

**`down = green` in the stylesheet.** `lab.css:115` and `lab.css:490` both set
`.down{color:var(--green)}`. Down is coded as good — correct for unemployment,
exactly backwards for payrolls, participation, and employment-share. **It is the
same error the algorithm made, sitting in our CSS.** Five-minute fix; it touches
production during a design phase, so it is question 4 on the operator's ask list.

**Ward M composite mixes two months.** Five gauges read August; the credit gauge
reads July because August's NFCI month is incomplete. The `{{market-current}}`
token correctly refuses to resolve. **That refusal is the gate working** — do not
reach for a literal to get around it. The Aug 11 edition describes direction and
discloses the mix instead.

---

## 5 · Operating procedures

**Push:** `git fetch` → `git merge-base --is-ancestor origin/main main` →
fast-forward push. If diverged (oozebot commits daily), stash -u the other
sessions' WIP, pull --rebase, push, stash pop.

**Ward M refresh, order matters:** `node scripts/collect-sectors.js` **then**
`node scripts/collect-market.js` (breadth reads sectors.json), then
`node scripts/og-cards.js`, then `node scripts/stamp.js`.

**After any page or article work:** `node scripts/static-pages.js` ·
`node scripts/rss.js` · `node scripts/stamp.js` · every test file individually
(`node --test tests/X.test.js` — running the whole dir masks failures) ·
`node scripts/narrative-check.js` · orphan-class check.

**The narrative gate will catch you.** It fails the build on a bare score literal
in prose. Use tokens: `{{s:YYYY-MM}}`, `{{peak:A..B}}`, `{{market:YYYY-MM=N}}`,
`{{market-current:YYYY-MM=N}}`, `{{revision-old:VER:YYYY-MM=N}}`. It caught three
errors in one edition that would otherwise have shipped, including a stale token
in an already-published article.

**Honesty rules, non-negotiable:** no hand-written numbers in prose; never tune
outputs for aesthetics; a default or placeholder is never rendered as a
measurement; corrections are published, never silently patched; the byline names
the engine that actually wrote the piece.

---

## 6 · What changed this session — the short version

- **Editorial Constitution locked at v1.0** after reading all 24 published reports
  in sequence through five adversarial lenses.
- **Four live falsehoods found and fixed:** the archive's ounces didn't sum to the
  reading (11/11 reports); "the two instruments share no data" had been false
  since v3 put NFCI in the jar; the Ward M credit gauge said "0 oz in household
  jar" for a series carrying 3%; three banned intensifiers were on published pages.
- **Three public corrections published.** That is the system working.
- **The front page was pinning the Latest File slot** to the monthly seal, so
  weekly editions could never lead, and the lead title was overridden
  unconditionally. Fixed.
- **The July report was rewritten three times** — the final version is the
  editorial model, and the style guide codifies it.
- **Design exploration phase 1** shipped: `mockups/inspiration-board.html`.

---

## 7 · Territory — read this before you commit anything

**Never `git add -A`.** Three agents share this working tree:

- **Claude** (you): page HTML, `lab.js`/`lab.css`, editorial generators in
  `scripts/`, `research/editorial/`, `mockups/`
- **Codex:** `collect.js`, `backtest.js`, `scripts/lib/`, `tests/`,
  `.github/workflows/`, `data/*` commits
- **Hermes:** `.hermes/`, `reports/`, `config/`, `scripts/weekly-*`

On 2026-08-02 a blanket add swept an uncommitted recipients file containing a
third party's personal email into a public push and required a history rewrite to
purge. **Stage explicit paths, every time.** `config/weekly-recipients.json` is
gitignored and stays that way; recipient identities never enter any tracked file.

There is currently uncommitted Hermes WIP in the tree (`scripts/weekly-deliver.js`,
`tests/weekly-deliver.test.js`, and several untracked files). Leave it alone.

---

## 8 · The thing worth remembering

Three editions and two canonical drafts have now failed adversarial review — none
on taste, all on statements that were checkably untrue. Every defect was found by
re-deriving a published number from files in this repo, which is exactly what a
skeptical reader does.

**A validator is worth building if, and only if, it would have caught something a
reader could have caught.** D-0, D-3, D-4 and D-9 each correspond to a false
sentence that actually shipped. Build those and the next edition fails for the
right reasons or passes for real ones.

The product's entire differentiator is that its numbers can be checked. Every
hour spent making that more true is the highest-value hour available.
