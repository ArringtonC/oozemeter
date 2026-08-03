# HERMES IMPLEMENTATION ROADMAP

**Status:** Active · **Owner:** Hermes (lead) + Codex (data pipeline)
**Prerequisite:** Editorial Constitution v1.0 — **LOCKED 2026-08-02** ✅
**Issued:** 2026-08-02 · **Supersedes:** nothing. Complements
`research/CODEX-TASKS-2026-08-01.md` (task-number cross-refs throughout).

---

> **Read this before anything else.**
>
> **Do not improve the writing unless required to implement the Editorial
> Constitution.** The publication's voice is owned by the Constitution
> (`research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md`, LOCKED). Your
> responsibility is to build the infrastructure that preserves it. **Prefer
> deterministic systems over prompt complexity whenever possible.**
>
> Your mission is no longer to write better. **Your mission is to make it
> impossible for the publication to violate the Constitution.**

---

## Mission

Build the production system that guarantees OOZEMeter's Editorial Constitution.
The objective is not to write articles. The objective is that a Constitution
violation cannot reach a reader without failing a build.

## Guiding principle

**Claude defines the publication. Hermes builds the publication. Codex implements
the data pipeline.** Every implementation decision traces back to a numbered
section of the Constitution. If a task cannot cite its section, it is not on this
roadmap.

Claude is now **advisory**. Future changes to the publication come through the
Constitution and the Editorial Decision process, not through exploratory writing.

---

## Where the project actually stands — three gates

### Gate 1 — Editorial · **PASS** ✅

- Editorial Constitution v1.0 LOCKED
- Corpus of 24 editions analysed (five lenses, adversarially challenged)
- Identity established and evidenced
- Corrections policy written (§15) **and exercised twice in public**
- Governance established (§14 amendment rule, §16 staged-rules register)

### Gate 2 — Engineering · **FAIL** ← you are here
*(revised 2026-08-03 after reviewing the first real edition — further along than
this roadmap originally assumed; see `EDITION-REVIEW-2026-08-03.md`)*

- ☑ **Evidence packet exists** — `weekly-evidence/v1`, hash-chained, facts keyed
  with unit + asOf + basis, gates recorded with commands. Epic 1 substantially
  delivered and better than specified.
- ☑ **Observed values retained** — for the WEEKLY path. All 14 are in the packet
  (`hh.gas.value: "$4.10"` etc). Epic 2 is a *renderer* problem here, not a data
  problem. Still outstanding for the ARCHIVE path (backtest retention, Codex 8).
- ☐ **Validators enforce the Constitution** — `validation.json` returned
  `"pass", failures: []` on an edition containing a false sentence and six rule
  violations. **This is now the critical path.**
- ☐ **Failing gates actually block** — two gates failed (one with 19 findings)
  and the edition published. A gate that does not stop publication is decoration.
- ☐ Regression tests over the archive

### Gate 3 — Publication · **FAIL**

- ☐ Two consecutive editions approved against the locked Constitution

**The project is 1 of 3 gates complete, not "blocked."** Gate 2 is entirely
engineering. Nothing in Gate 2 requires an editorial decision.

---

## What is already done — do not redo

| Thing | State | Where |
|---|---|---|
| Constitution v1.0 | LOCKED, 16 sections + staged register | `research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md` |
| Corpus + analysis | 24 editions read, findings adjudicated | `research/editorial/trailing-year-reports.md` |
| Five-ways voice exercise | Done, 3 amendments adopted | `research/editorial/june-2026-five-ways.md` |
| Archive generator | Fixed: apportionment, dates, agreement, ties, empty sections, gap disclosure | `scripts/backfill-reports.js` |
| Shared furniture (byline + confidence) | Emitting, asserted 23/23 | `scripts/editorial-furniture.js` |
| Breadth delta fabrication | Fixed — publishes `null`, never a hardcoded 0 | `scripts/collect-market.js` |
| Firewall falsehood | Fixed site-wide | `market.html`, generator, editions |
| Corrections | 1 published | `/files/correction-2026-08-archive-ounces/` |
| Editorial Incident (Oct 2025 gap) | Drafted, verified against BLS primary sources | `research/editorial/incident-2025-10-draft.md` |

---

## Epic 1 — Evidence Pipeline (highest priority)

**Goal.** One canonical evidence packet that every publication consumes. No engine
may read raw payloads directly once this exists.

**Constitution basis:** §10 (evidence), §4 (observed values), §12 (assertions over
checklists).

- [ ] Design **Evidence Packet v1** schema.
- [ ] Preserve observed/raw values alongside normalized (stress) values.
- [ ] Preserve contribution values **already apportioned** — parts sum to whole.
- [ ] Preserve previous-period values for every line and gauge.
- [ ] Preserve observation dates *and* computation dates, distinguished (§4).
- [ ] Preserve freshness metadata and per-line cadence.
- [ ] Preserve methodology version.
- [ ] Preserve source references (publisher, series ID, URL, proxy flag).
- [ ] Preserve **allowed editorial claims** and **prohibited claims** per packet.
- [ ] Every published number traces to a packet field. No exceptions.

**Deliverable:** `evidence/YYYY-MM/` (and `evidence/YYYY-WW/` for weeklies).

**Known input gaps this epic must close** (verified, with locations):
- `research/backtest-results.json` stores only `{month, ooze, stresses}` — raw
  observables are read and discarded around `scripts/backtest.js:95-102`.
  (Codex task 8.)
- `data/market.json` carries **no prior score**, so no ward edition can state its
  own delta (§6.1). Currently an undisclosed limitation.
- `data/latest.json` stores month-over-month `delta` only — a *weekly* edition
  cannot report week-over-week change. (§16, staged.)

---

## Epic 2 — Observed Value Support

**Goal.** Make the Constitution's load-bearing rule satisfiable.

> §4: *No line is named in prose without the observed value that produced its
> score, in the same sentence.*

This is why 23 of 24 published reports were about the instrument rather than the
economy: **zero dollar signs and zero percent signs across 735 lines.** The live
seal does it right (*"down 11 points with the pump price at $4.10"*) only because
`data/latest.json` retains per-line observed values. The archive cannot.

- [ ] Extend backtests to retain raw observables per line per month.
- [ ] Store observed *and* normalized values, each with its unit.
- [ ] Expose observed values through the evidence packet.
- [ ] Tests asserting the two stay synchronized and never diverge silently.
- [ ] Backward compatible: `monthly[].stresses` consumers must not break.

**Unblocks:** the archive regeneration, a real household translation paragraph,
and any governing idea that argues about the economy rather than the arithmetic.

---

## Epic 3 — Validator Framework · **CRITICAL PATH**

**Goal.** Turn the Constitution into executable software. **Any checklist item
expressible as an assertion about generated output must be one** (§12) — three
plural-agreement failures shipped past a human checklist that named the exact
hazard.

Each validator: deterministic, cites its Constitution section, produces an
**actionable** failure (what, where, expected vs actual), and gates the build.

- [ ] **Evidence traceability** — every number resolves to a packet field (§10)
- [ ] **Observed-value pairing** — every named line carries its value in the same
      sentence (§4)
- [ ] **Fraction assertion** — printed parts sum to the printed whole (§3)
- [ ] **Unit discipline** — no bare signed numbers; `/100` on levels; line-stress
      vs score points vs gauge heat distinguished (§3)
- [ ] **Unsupported causal claims** — no claim not earned by the figures (§5)
- [ ] **No-prediction** — no future-tense claim about outcomes (§5)
- [ ] **Ward M / household firewall** — zero-weight declaration present in full
      words; **and the shared-input disclosure is accurate** (§5, §11)
- [ ] **Shared-series detector** — flag any series appearing in both instruments
      and require it be disclosed (see Technical Debt; this is how the "share no
      data" falsehood survived a methodology change)
- [ ] **Freshness + cadence** — as-of dates present, stale disclosed (§4)
- [ ] **Methodology validation** — version present and matching the payload
- [ ] **Confidence statement** — emitted by the shared function, unmodified (§10)
- [ ] **Byline** — emitted by the shared function, last line (§4)
- [ ] **Historical placement** — verdict decile stable against a ±1 move, or
      reported as a band (§10)
- [ ] **Tie detection** — equal figures reported as tied, never ranked (§10)
- [ ] **Section anatomy** — the seven names present, verbatim, no empty sections,
      no renames (§6)
- [ ] **Protected-phrase anchoring** — each phrase verbatim *and* in a paragraph
      carrying the fact it invokes (§7)
- [ ] **Gap handling** — no interpolation; gaps disclosed on every surface
      carrying a delta: dek, key point, body (§9)
- [ ] **Grammar/agreement** — plural line names take plural verbs (§12)
- [ ] **Staged-rule guard** — a staged rule is never faked; interim behaviour is
      printed instead (§16)
- [ ] **Do-Not-Build compliance** — `research/do-not-build.md`

---

## Epic 4 — Corrections Pipeline

**Goal.** Corrections are permanent editorial artifacts, not patches.
**Constitution basis:** §15.

- [ ] `corrections.jsonl` — append-only
- [ ] Severity levels
- [ ] Preserve original values and corrected values
- [ ] Preserve timestamps (detected, published)
- [ ] Preserve reason and the machine change that prevents recurrence
- [ ] Preserve approving editor
- [ ] Auto-generate the correction notice from the record
- [ ] Link the notice from every corrected edition

**Backfill the two that already happened:** the archive ounce-scale error and the
shared-inputs firewall falsehood.

---

## Epic 5 — Repository Architecture

**Goal.** Separate production responsibilities.

```
evidence/      drafts/       validators/     reports/
corrections/   governance/   archive/        skills/
```

**Territory rules — non-negotiable, one PII incident already:**
- **Never `git add -A`.** Three agents share one working tree. On 2026-08-02 a
  blanket add swept an uncommitted recipients file containing a third party's
  personal email into a public push; it required a history rewrite to purge.
  **Stage explicit paths, every time.**
- Recipient lists and any PII never enter the repo. `config/weekly-recipients.json`
  is gitignored — read recipients from environment or an untracked local file.
- Claude owns: page HTML, `lab.js`/`lab.css`, `scripts/` editorial generators,
  `research/editorial/`. Codex owns: `collect.js`, `backtest.js`, `scripts/lib/`,
  `tests/`, `.github/workflows/`, `data/*` commits. Hermes owns: `.hermes/`,
  `reports/`, `config/`, `scripts/weekly-*`, and everything this roadmap creates.

---

## Epic 6 — Editorial State Machine

No publication may skip a state. Each transition is logged and auditable.

```
Evidence Built → Draft Generated → Validation Failed
              ↘ Ready For Review → Revision Requested
                                 ↘ Approved → Published → Correction (optional)
```

- [ ] State persisted per edition, not inferred
- [ ] Illegal transitions rejected by software, not convention
- [ ] `Published` unreachable without an `Approved` record naming a human

---

## Epic 7 — Historical Archive as Regression Tests

**Goal.** The archive is the test suite for editorial drift.
**Constitution basis:** §6 strip-the-headline test, §8 unfired-branch audit.

- [ ] Diff every new edition against the archive
- [ ] Detect repeated openings (62.5% of corpus paragraphs began with one of
      seven three-word stems — that is the metric to drive down)
- [ ] Detect repeated governing ideas
- [ ] Detect editorial drift and validator regressions
- [ ] **Unfired-branch report** — any authored branch that never printed in a
      year is either dead logic or the best sentence nobody has read. Two such
      branches existed in the corpus, including the best sentence written for it.
- [ ] **Strip-the-headline test** — if a reader can tell which engine wrote which
      edition, the furniture is not shared yet (currently expected to FAIL between
      `story.js` and `backfill-reports.js`; tracked in §16)

---

## Epic 8 — Editorial Desk (review workflow)

- [ ] Draft posting · validator summary · evidence summary · corrections summary
- [ ] Approval workflow · revision workflow · audit log
- [ ] **No automatic publication.** Ever, at this stage.

---

## Epic 9 — Canonical Editions

**BLOCKED on Epics 1–3.** Both editions were written and failed independent
adversarial review (13 factual errors, 20 rule violations). Full findings are in
the edition headers.

- [ ] **Edition 01 — fixes required** (`research/editorial/canonical-editions/01-…`):
      three weekly lines not two (`financial` is weekly and posted the only
      `new-observation`); employment is third-lightest not lightest; four of seven
      lines named with no observed value; close claims cited series that the prose
      never names; bare composite level; paragraphs over the 1–3 limit; verdict
      decile unstable at 25.
- [ ] **Edition 02 — rewrite required** (`…/02-…`): narrative inverted (said
      gauges cooled; the ward rose 7 points, 30 → 37); reported a fabricated
      breadth delta as "unchanged" when breadth was the largest move on the panel;
      missing three mandatory §6 sections including the household translation;
      confidence statement not the one the shared function emits; a monthly mean
      described as "this week."
- [ ] Re-run validators → human approval → promote to canonical

---

## Epic 10 — Weekly Automation

**BLOCKED until every box below is checked:**

- [ ] Evidence Packet complete (Epic 1)
- [ ] Observed values retained (Epic 2)
- [ ] Validators passing (Epic 3)
- [ ] Corrections pipeline complete (Epic 4)
- [ ] State machine enforced (Epic 6)
- [ ] Review workflow complete (Epic 8)
- [ ] **Two consecutive canonical editions approved** (Epic 9)

Only then enable Monday automation. **The gate is not a formality; it has already
rejected two editions and caught two live falsehoods.**

---

## Technical debt (carry into the epics above)

- [ ] Prior market score in `data/market.json` (§6.1 blocker)
- [ ] **Shared-series detection** — the "two instruments share no data" claim was
      true until methodology v3 put the Chicago Fed NFCI in the jar at 3%; NFCI is
      also one of Ward M's six gauges. Same series, same value (−0.54), false on
      the live site and in 12 archive reports until 2026-08-02. **When a
      methodology changes, the prose describing the old one must be swept
      automatically.**
- [ ] Raw observable retention (Codex task 8)
- [ ] Month status as a first-class state — `COMPLETE / PARTIAL / BLOCKED /
      UNPUBLISHABLE` (Codex task 7). October 2025 is `UNPUBLISHABLE`: BLS canceled
      the October CPI and never fielded the household survey, and will not
      retroactively. Verified against primary BLS notices.
- [ ] `scripts/editorial-furniture.js` mislabels methodology recalibrations as
      "source-revision events" — `data/revisions.json[1]` is a recalibration.
- [ ] Wire `scripts/story.js` to the shared furniture module (§16)
- [ ] Week-over-week retention for weekly editions (§16)
- [ ] Historical similarity search · archive performance

---

## Future work (after v1 ships)

Editorial quality scoring · reader experience scoring · drift detection ·
institutional memory automation · annual Constitution review · Editorial RFC
workflow.

---

## Success criteria

The project is complete when:

- Every published claim is traceable to evidence.
- Every deterministic rule is enforced by software.
- Every editorial rule is represented in the Constitution.
- Corrections are permanent and transparent.
- **The publication cannot violate the Constitution without failing validation.**
- The weekly publication is a predictable, trustworthy editorial workflow.
