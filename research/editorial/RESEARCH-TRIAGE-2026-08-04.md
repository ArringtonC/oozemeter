# OOZEMETER — OPERATOR DECISION DOCUMENT
### Six research documents on newsroom practice · triage + prosecution · 2026-08-04
### Author: Editor-in-Chief · Requires operator decision on §14 amendments only

---

## 1. THE VERDICT ON THE RESEARCH

Roughly 27,000 words produced seven changes. That is a 74% ALREADY rate on substantive recommendations, and the pattern in the misses is sharp enough to be useful: **every single survivor is a place where we wrote the rule and never built the emitter.** Not one of the six documents told us a principle we did not already hold. §15 already demands a correction state what changed in the machine; nothing emits a corrections block. §3 already prohibits six intensifiers "in every engine"; three are live on reader-facing pages right now (`scripts/lib/market-gauge-content.js:11,76,97`). §4 already requires "the observed value **that produced its score**"; `scripts/collect.js:108,110` scores jobs and housing as `Math.max()` over two competing series and the packet prints the first candidate unconditionally. about.html and policies.html already promise a truthful AI disclosure; both publish a two-category taxonomy with no bucket for the model-drafted editions we are actually shipping. The research is confirmation that our rulebook is standard-compliant and, in several places (hash-bound approval, missing-data-as-content, §4's same-*sentence* pairing), stricter than AP, Reuters, the FT and OWID. What it is not is a source of new rules. Three of the six documents are addressed to a repository that does not exist — `validators/*.py`, `make validate`, `archive/YYYY-WW/`, `session_search`, `style-metrics.jsonl` — and two of them assert as "existing project design" things this repo has never had (`git tag` returns **0**; `constitution_version` appears nowhere). Treat Part 1 of each as reading; treat Part 2 of each as fiction. **The delta is not new doctrine. It is seven emitters.**

---

## 2. WHAT WE ALREADY DO

The strongest recurring recommendations across all six documents, and where we already implement them. Every row was independently proposed by two or more documents.

| Recurring recommendation | Already implemented at |
|---|---|
| Structurally separate verification stage between drafting and publication | `research/hermes/HERMES-IMPLEMENTATION-ROADMAP.md` — three-gate model (Editorial / Engineering / Publication) + Guiding principle |
| Append-only corrections log with original value, corrected value, timestamps, reason, approving editor, machine change | `HERMES-IMPLEMENTATION-ROADMAP.md` Epic 4, all seven bullets — a superset of every schema proposed |
| A correction must state what was wrong, where, for how long, and what changed so it cannot recur | `research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md` §15 — stricter than AP/Reuters, which stop at "what was wrong" |
| Named human at the publish gate; no automatic publication | Roadmap Epic 6 ("Published unreachable without an Approved record naming a human"), Epic 8; shipped as `reports/editions/2026-08-03/approval.json` |
| Approval must bind to the artifact, not just to a moment | `scripts/weekly-deliver.js` re-hashes edition + evidence at send and refuses on drift — binds to SHA-256, stricter than the "commit hash" the research asks for |
| Every number traces to a cited, timestamped evidence entry | Roadmap Epic 1 ("No exceptions") + Epic 3 "Evidence traceability"; partly shipped as `claimIds` in `reports/editions/2026-08-03/edition.json` |
| A rule must be mechanically checkable, not an aspiration | Constitution §12 ("Any checklist item expressible as an assertion about generated output must be one") and §14 ("No 'always' rule is ACTIVE until the engine that publishes it emits it") |
| Archived editions are immutable; corrections supersede, never overwrite | `research/editorial/EDITION-CHANGELOG.md` header + standing rule 4; `writeImmutable()` in `scripts/lib/weekly-edition.js`; D-0 `replaces`/`supersededBy` |
| Corrections held to the same gate set as editions | `research/codex/CODEX-DIRECTION-2026-08-04.md` D-0 |
| Driver selection deterministic and upstream of drafting; ties reported as ties | `biggestMover()` in `scripts/lib/weekly-brief.js`; `hh.topContribution` tie array in `scripts/lib/weekly-edition.js`; Constitution §10 |
| A non-blocking gate classification must be a dated decision, not a default | CODEX-DIRECTION D-4 |
| Missing / incomplete data is disclosed rather than silently filled | Constitution §9 ("Missing evidence is editorial content… No interpolation, ever; a gap is data") — stronger than OWID's withhold-and-flag |
| Versioned, dated methodology changes with quantified blast radius | `policies.html` §Methodology version history + `data/revisions.json` (v3 moved 180 of 281 months, 9 band flips) |
| No forecasting, no advice framing, denylist enforced | Constitution §5, `research/do-not-build.md`, Roadmap Epic 3 final item |
| Archive as regression corpus for editorial drift | Roadmap Epic 7 — already carries a measured baseline (62.5% of corpus paragraphs opening with one of seven three-word stems) |
| Log rejected proposals with reasons | Constitution §7 "Not protected, deliberately"; EDITION-CHANGELOG "What was deliberately kept" |
| Staged rules carry owner, blocker, interim behaviour | Constitution §16 |

**Read this table as the finding it is:** on governance structure, we are not behind newsroom practice. We are ahead of it on three counts (hash-bound approval, missing-data-as-content, same-sentence observed-value pairing) and level on the rest.

---

## 3. ADOPT — THE DELTAS

Seven items. Two require an operator decision under §14; five are pipeline tasks.

---

### 3.1 — D-9 · BLOCKING · The packet must describe the input that actually produced the score
**Owner: Codex/data · File: `research/codex/CODEX-DIRECTION-2026-08-04.md` (new blocker)**

**What it is.** `scripts/collect.js:108,110` — verified today:

```js
jobs:Math.max(interp(ANCHORS.unemployment,un),interp(ANCHORS.claimsK,icsa/1000)),
housing:Math.max(interp(ANCHORS.mortgageRate,mort),interp(ANCHORS.mortgageDelinq,mdel)),
```

Two lines score as the maximum of two independently anchored series; the packet prints the first candidate (`hh.jobs.value: "4.2%"`, `hh.housing.value: "6.66%"`). Whenever the second branch binds, §4 is violated with a perfectly correct date. D-1's own reproduction table shows jobs reproducing exactly (14.3 = 14.3) — that is luck: unemployment happened to bind in June, which is why no review caught it. The gas line is the same defect one layer up: scored from `gas*cpiNow/cpi` (`:113`), printed as the latest nominal weekly price, and `methodologySnapshot.transforms` (`scripts/collect.js:216`) lists only `claims`, `inflation`, `financial`, `quarterly` — **gas is absent, and it is the largest transform in the model.**

**What changes Monday.** Codex stops treating D-1 (vintage) as the complete fix for §4 and reopens the packet emitter.

**Exact text to add:**

> **D-9 · BLOCKING · Record the input that produced the score, not the first candidate.**
> `scripts/collect.js:108` and `:110` select jobs and housing as the maximum of two anchored series. Emit per line in the evidence packet:
> `scoredBy: {seriesId, value, unit, period, transform}` — the branch that returned the maximum, and every operation between the published observation and the scoring input (aggregation, deflation, year-over-year, forward-fill) or the string `none`;
> `runnerUp: {seriesId, value}` — the branch that did not.
> `scoredValue` (D-1) resolves to `scoredBy.value`, never to the first candidate. `methodologySnapshot.transforms` becomes total, not partial — add `gas: 'Calendar-month mean of weekly retail prices, CPI-deflated to the current base month'` and an explicit entry or `none` for housing, credit, auto and jobs.
> A validator rejects any sentence pairing a line's contribution or stress with an observable whose `seriesId` differs from `scoredBy.seriesId`, or printing an observation whose `transform` is not `none` without the transform in the same clause.
> **Acceptance:** for every month in the archive, re-deriving the published stress from `scoredBy.value` and the v3 anchors alone reproduces it exactly. Where the two branches are within one stress point, set `scoredBy.contested: true` and the prose names both.

`runnerUp` is recorded, never printed. Printing both candidates would put the losing input beside the winning score as though both produced it.

---

### 3.2 — Corrections record + open-retraction guard
**Owner: Hermes/pipeline · Files: `HERMES-IMPLEMENTATION-ROADMAP.md` Epics 3 and 4**

**What it is.** Three documents proposed three fields on the same unbuilt record. This is one spec. The regex-based `retractedPattern` approach is rejected in favour of a fact-key join, because the join runs on substrate that already exists: `reports/editions/2026-08-03/evidence.json` ships 49 keyed facts including `market.breadth.delta`, and `edition.json` binds prose to `claimIds` in 14 places. A regex over prose is brittle and needs maintenance; a key join is exact.

**What changes Monday.** Epic 4's schema is finalised before D-0 writes the first record, and Epic 3's twenty unordered checkboxes acquire an ordering rule.

**Exact text — Epic 4 record, required fields addendum:**

```
factIds[]               evidence.json fact keys this correction retracts,
                        e.g. ["market.breadth.delta"]
status                  "open" until the machine change has landed, then "fixed"
disclosure              the sentence any edition must carry while status is open
shouldHaveBeenCaughtBy  a gate name from the GATES array in scripts/weekly-package.js,
                        a validator name from Epic 3, or the literal "none-exists"
detectedBy              "validator" | "operator" | "board-review" | "reader" | "agent"
```

**Exact text — Epic 3 validator:**

> **Open-retraction guard (§15, §5).** Before render, join every `claimIds[]` array in `edition.json` against the index of open retractions. If a prose unit is bound to a fact key with an open retraction and does not carry that correction's `disclosure` text, the build fails and names the unit, the fact key and the correction id.
> **Acceptance:** replaying `reports/editions/2026-08-03/` through the pipeline fails on the MARKET OOZE paragraph, which is bound to `market.breadth.delta`. A validator that passes that file is not built yet.

**Exact text — Epic 3 ordering rule:**

> A correction whose `shouldHaveBeenCaughtBy` is `"none-exists"` is a validator request. Epic 3's checklist is ordered by the count of open corrections pointing at each missing validator, highest first — never by the order the items happen to be written down. A correction naming an existing gate that ran and passed is a defect in that gate, filed against it rather than as a new rule.

This answers the question the operator faces the moment D-0 ships: twenty unbuilt validators, no ordering.

---

### 3.3 — §15 AMENDMENT · A correction is emitted, delivered, and closed
**Owner: OPERATOR — requires a decision under §14 · File: `research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md` §15**

**What it is.** Three documents each proposed a separate §15 amendment. All three are correct; making the operator amend a locked document three times in one week is worse than once. Each is verified:

- `scripts/editorial-furniture.js` is **36 lines** and exports `BYLINES` and `confidenceStatement` only. No corrections emitter exists. `2026-08-03/edition.txt` has no corrections block; `2026-08-04/edition.txt:106` has a hand-written one. This is the §4 byline story repeating exactly — mandatory disclosure, no emitting function, dropped in 23 of 23 archive reports.
- `scripts/weekly-deliver.js:84` writes a `DELIVERED` marker containing a bare timestamp. Nothing records which channels or how many recipients received an edition. The Aug 3 edition was emailed; the correction exists as a DRAFT text file. We could not comply with same-channel republication even if we decided to.
- §15 requires "what changed in the machine so it cannot recur" and §12 requires anything expressible as an assertion to be one, but nothing binds them. The Aug 4 changelog had to publish, as a §15 required element, the fact that nothing in the collector was fixed yet.

**What changes Monday.** One commit to the Constitution, then one Hermes task and one furniture task descend from it.

**Amendment text, verbatim — three clauses appended to §15 (OPERATOR DECISION REQUIRED, §14):**

> **The corrections slot is unconditional.** Every generated report and every edition carries a CORRECTIONS block emitted by `scripts/editorial-furniture.js`, present whether or not a correction exists. With no standing correction it prints, verbatim: *"No corrections stand against this report."* With one or more it prints, per correction: the correction ID, the date issued, one sentence on what was wrong, one sentence on what changed in the machine, and the link to the correction file. The confidence statement gains a fourth clause carrying the count of standing corrections, alongside the methodology version, the stale count and the revision count. A disclosure that appears only when it is bad news is a disclosure a reader cannot read — its absence has to mean something.
>
> **A correction is delivered to every channel the corrected edition reached.** An edition that went to inboxes is not corrected by a web page alone. Where a channel cannot be re-reached, the correction notice names the channel and says so.
>
> **A correction is not closed by publishing it.** Every correction names a test that fails against the pre-correction inputs and passes against the corrected ones, committed as `tests/regression-<correction-id>.test.js` and referenced by id in the correction record. Until that test exists, the machine-change claim is an assertion the facility has not checked, and the facility does not publish unchecked assertions about itself. A correction that cannot be expressed as a failing test says so, in the correction, and names what would have to change for it to become one.
>
> Until the emitting function ships, the first clause is listed in §16 with its interim behaviour, not assumed.

**Descending pipeline task (`scripts/weekly-deliver.js`, Hermes):** replace the empty `DELIVERED` marker with
`delivered.json = {editionId, editionHash, deliveredAt, channels:[{name:"email", recipientCount:N},{name:"discord", channelId:"…"}]}`.
The D-0 re-issue path reads the superseded edition's `delivered.json` and does not mark a re-issue complete until it has reached that same channel set.
**Acceptance:** `reports/editions/2026-08-04/` cannot be marked delivered while `2026-08-03`'s `delivered.json` lists an email channel the re-issue has not reached.

**Hard constraint the research missed:** `recipientCount` is a count. Recipient identities never enter `delivered.json` or any other tracked file. Roadmap Epic 5's territory rules exist because one blanket `git add -A` already put a third party's email into a public push and required a history rewrite.

29 test files already exist under `tests/`, so the closure fixture has a home and a runner.

---

### 3.4 — The AI disclosure is false today · correct it AND give it an emitting function
**Owner: Claude/editorial (pages) + Hermes/pipeline (schema) · Files: `policies.html`, `about.html`, Constitution §4, `scripts/lib/weekly-edition.js`, `scripts/editorial-furniture.js`**

**What it is.** `about.html:38` says OOZEBOT is "a deterministic script, not a chatbot. Every clause it writes is driven by a number in the data." `policies.html:35` says OOZEMeter publishes **two** kinds of writing. The weekly edition is neither, and `reports/editions/2026-08-04/edition.txt` signs *"Drafted by OOZEBOT."* `scripts/lib/weekly-edition.js:138-139` runs regexes for `/buckle up/`, `/let's dive in/`, `/economic landscape/`, `/game-changer/` — a deterministic template cannot emit "buckle up"; those guards exist because the prose is authored upstream. **This is a §5 two-surfaces-disagree violation sitting on a governance page**, and it is exactly the class of defect that failed both board reviews. It ships together with its emitter or not at all (§14).

**What changes Monday.** Two HTML sections rewritten; the Aug 4 edition's last line cannot ship as written.

**Exact text, replacing the `policies.html#editorial` paragraph and the parallel passage in `about.html`:**

> OOZEMeter publishes three kinds of writing, and every piece says which it is.
>
> **Facility-generated** — Specimen Reports and data summaries, emitted by OOZEBOT, a deterministic script. Every clause is produced by code from a number you can check in `data/latest.json`. No language model is in the path. Signed *"Generated by OOZEBOT."*
>
> **Model-drafted, operator-approved** — the weekly edition. A language model drafts the prose from an evidence packet it cannot edit and a score it cannot compute; every figure is checked against that packet, and no edition is distributed without a named human approval recorded in the edition's `approval.json`. Signed *"Drafted with AI · approved by &lt;name&gt;,"* with the approval record linked.
>
> **Operator dispatch** — written by a human, labeled as such.
>
> No piece of any kind may state a figure that does not trace to a cited public source. The editorial rules these pieces are held to are public: `research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md`.

**Do not write the stronger claim yet.** One drafter proposed "the validators decide whether it ships." That is not true while `scripts/lib/weekly-edition.js:250,254` hardcodes `status: 'pass'` and `failures: []` (D-4 / C3). Ship the copy above, which claims only what is true, and upgrade the sentence when D-4 lands.

**Constitution §4, appended to the byline bullet (OPERATOR DECISION REQUIRED, §14):**

> The byline names the engine that actually wrote the piece. *"Generated by OOZEBOT"* is reserved for deterministic output. A piece whose prose was drafted by a language model carries *"Drafted with AI · approved by &lt;named human&gt;"* and links its approval record. A byline that names a different engine than the one that wrote the piece is a §5 falsehood, not a stylistic choice, and the disclosure runs unconditionally — never subject to a per-week judgement about whether the model's role was "material."

**Hermes task (rides D-7, already open):**
1. `weekly-edition/v1` gains a required top-level block; a missing one is a schema error, not an editorial oversight:
   `"authorship": {"mode": "deterministic" | "model-drafted", "engine": "<agent>", "model": "<model id>", "draftedAt": "<iso>"}`
2. `writeApprovedEditionPackage` copies the authorship block into `approval.json`, so the receipt states *what* was approved as well as who approved it.
3. `scripts/editorial-furniture.js` gains `byline(authorship, approval)`, emitting `BYLINES.live` only when `mode === 'deterministic'`. Assert in `tests/` that no edition can render a byline naming an engine other than the one in its own `authorship` block.
4. Before `reports/editions/2026-08-04/edition.txt` ships, its last line changes from *"Drafted by OOZEBOT · reviewed by the Division of Economic Containment"* to the emitted model-drafted form.

Without step 3 the byline is hand-typed — the §10 "numbers resolve from data, never hand-typed" failure applied to a disclosure.

---

### 3.5 — `approval.json` states its type and its override status as fields, not as free text
**Owner: Hermes/pipeline, folded into D-0 · File: `scripts/lib/weekly-edition.js`, `scripts/weekly-deliver.js`**

**What it is.** Verified today, `reports/editions/2026-08-03/approval.json`:

```json
"reviewerName": "Arrington (explicit ship-now instruction)"
```

A recorded action smuggled into a name field, on an edition that shipped with two failing gates and 19 findings. One of the six documents praises our publish gate for having "no override path for validator failures." **The override path exists, was used on the only real edition we have published, and left no structured trace.** D-0 is about to emit `approval.json` for corrections through the same code, so the first correction the pipeline ships would be indistinguishable from a Monday publish.

**What changes Monday.** The schema is fixed before D-0 writes through it, and Aug 3 is backfilled.

**Exact schema, replacing the current five fields:**

```json
{
  "type": "edition" | "re-issue",
  "replaces": "<superseded edition id>" | null,
  "gateStatus": "pass" | "pass-with-disclosed-failures" | "fail",
  "override": null | {"failedGates": ["<gate name>"], "reason": "<the operator's own words>"},
  "reviewerId": "…", "reviewerName": "…", "approvedAt": "…",
  "evidenceHash": "…", "editionHash": "…"
}
```

**Rule text:**

> `reviewerName` carries a name and nothing else. If `gateStatus` is not `"pass"`, `override` must be non-null and name every failed gate, or `scripts/weekly-deliver.js` refuses to send.
>
> The approval token differs by type. A routine publish is approved by the existing ✅ reaction. Anything that corrects a *published* artifact requires the operator to reply with the literal string `APPROVE CORRECTION <editionId>`, matched exactly by `scripts/weekly-deliver.js`; a reaction alone is rejected and the edition stays Approved-pending. Shipping this week's work and telling a reader a published number was wrong are not the same decision, and a reaction cannot encode which one was made.

**Backfill** `2026-08-03` with `type: "edition"`, `gateStatus: "pass-with-disclosed-failures"`, `override.failedGates: ["divergence-history freshness", "methodology v3 publication"]` (both verified `blocking: false` at `scripts/weekly-package.js:33-36`), `override.reason: "explicit ship-now instruction"`.

This preserves D-4's three-state model. The absolutist "no publish with a known failing check" rule proposed by one document is rejected: a blanket hard-stop teaches the operator to reclassify gates as non-blocking, which is precisely how `validation.json` came to say `pass` over 19 findings.

---

### 3.6 — Register discipline · the intensifier lexicon, with three live violations
**Owner: Hermes/pipeline · File: `HERMES-IMPLEMENTATION-ROADMAP.md` Epic 3**

**What it is.** §3 prohibits *sharply, dramatically, plunged, surged, spiked, soared* "in every engine." No engine checks. Three are live on reader-facing generated pages right now, all from `scripts/lib/market-gauge-content.js`:

- `:11` → `market/rates/index.html`: "steepened **sharply** as the Federal Reserve cut short rates"
- `:76` → `market/energy/index.html`: "WTI **surged** to record nominal levels"
- `:97` → `market/dollar/index.html`: "strengthened **sharply** during the crisis"

**What changes Monday.** The cheapest validator on the list, and the only one with currently-published failures. Roughly an hour, including the three copy fixes.

**Exact text — add to Epic 3:**

> - [ ] **Register discipline (§3).** A blocking validator rejects any generated text containing an intensifier on a data verb: `sharply`, `dramatically`, `plunged`, `surged`, `spiked`, `soared`. The prohibited lexicon lives in the same shared module as §3's permitted magnitude ladder (*was flat · held roughly steady · edged up · eased · climbed · fell*), so what is allowed and what is banned are defined in one place. First run must clear the three above.

**Half of this is rejected:** the unlabeled-hedge check (`roughly`, `about`, `nearly`, `some`, `several`). §3's own mandated ladder contains "held **roughly** steady." A hedge check collides with the rule it enforces, and narrowing it to hedges "attached to a printed figure with an exact packet value" turns a six-word blacklist into a parsing problem. The intensifier half ships this week. The hedge half does not ship.

---

### 3.7 — Evidence and validation records name the rules and the code that judged the edition
**Owner: Codex/data, folded into D-4 · File: `evidence.json` / `validation.json` emitters**

**What it is.** Two documents asked for the same block; neither noticed the other. Verified: `git tag` returns **0 tags**; `constitutionVersion` appears nowhere in the repo; gate entries carry `name`/`command`/`ok`/`blocking` and nothing else — so there is no way to tell which version of `scripts/market-integrity.js` returned `ok: true`. That is exactly the blind spot behind the 2026-08-02 patch that was supposed to fix the breadth delta and did not (D-3).

**What changes Monday.** D-4 is already reopening this file; these fields ride along at near-zero marginal cost.

**Exact spec.** Each gate entry becomes:

```json
{"name":"…","command":"…","codeVersion":"<git sha of the script the command runs>",
 "ranAt":"<iso>","ok":true,"blocking":true,
 "classifiedOn":"<date the blocking flag was decided>","expires":"<date>","detail":"…"}
```

Gate runs append, never overwrite: `"gateRuns": [{"attempt":1,"ranAt":"…","gates":[…]}, {"attempt":2, …}]`. A re-run after a fix leaves the failing attempt in the record; `status` derives from the last attempt only. For a publication whose differentiator is public error, a validation record that quietly forgets it once failed is the wrong artifact.

One top-level block naming the rule set:

```json
"governingRules": {
  "constitution": "v1.0",
  "constitutionSha": "<git sha of research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md at validation time>",
  "methodology": "3.0.0",
  "stagedRules": ["§4-observed-value","§11-placement-line","§2/§6-weekly-delta","§6-shared-furniture"]
}
```

**Deliberate amendment to what the research proposed: no git-tag ceremony.** A content sha is computable today, requires no discipline to maintain, and cannot drift from the file it names; a tag can. The `stagedRules` list is the part that earns its place — it makes §16's interim-behaviour promise machine-readable, so a later amendment cannot silently make an old edition look non-compliant, and a reader can see what we were not yet checking.

---

## 4. REJECTED, AND WHY

Written so a future session does not relitigate. Ordered by how likely each is to come back.

**Any two-person rule, second reviewer, or two-key control.** Proposed independently by three documents (corrections' "independent Complaints Commissioner," ai-gov's SOX two-key, newsroom's Standards-vs-Publisher channel). There is no second person. A two-key control where the same human turns both keys is theatre, and naming an agent as the second key produces exactly the defect D-0 forbids: "a hand-authored approval.json is a fabricated approval record." Our actual second reviewer is adversarial rather than hierarchical and already exists — `research/board/BOARD-REVIEW-2026-08-03-july-edition.md` is a four-officer review that returned "Do not publish." **Do not revisit until there is a second human.**

**Every Python file path, Makefile target and directory in all six documents.** `validators/*.py`, `scoring/score.py`, `make validate`, `publish.sh`, `archive/YYYY-WW/`, `drafts/`, `evidence/YYYY-WW/`, `corrections/`, `archive/style-metrics.jsonl`, `session_search`. None exist. This repo is Node; the only Python wired as a gate is `research/household_v2_baseline.py` at `scripts/weekly-package.js:32`. Following any of these literally builds a shadow pipeline beside the working one — the highest-cost failure mode for a solo operator sharing one tree with three agents (Epic 5 territory rules). **Port surviving rules onto real artifacts; discard the filenames.**

**New Discord channels** — `#oozemeter-constitution-feedback`, `#oozemeter-standards`, `#oozemeter-corrections`. `DISCORD_ALLOWED_USERS` has one entry. Every one of these is the operator filing a ticket to himself, plus a surface to maintain. Every error found so far came from adversarial re-derivation, not a reader report.

**Severity ladders as the primary correction key** (Typo/Clarification/Correction/Score Correction/Retraction). Severity ladders ration scarce editor attention across hundreds of stories a day. We publish roughly one edition a week and one editor reads all of it. §15 demands a *cause* key, not a severity key — "what changed in the machine so it cannot recur." Epic 4's undefined "Severity levels" checkbox is better filled by a root-cause enum: **arithmetic/logic defect · unsupported prose claim · source revision · methodology recalibration**. Severity routes to nothing; cause routes to a validator.

**Tier 0 auto-fix / auto-commit for typos.** There is no hand-editable published prose to fix. Site prose is generated (§10), so a typo in output is a template bug — a code change, which is what the approval gate is for. Granting any agent an unreviewed commit path across three shared trees reopens the incident that forced a history rewrite.

**Every rate limit, cooldown and cap.** One amendment per calendar month; 90-day resubmission cooldown; two net-new validator rules per quarter; amendment-velocity alarm above six per year. All throttle the input to a pipeline whose *output* is the bottleneck. Epic 3 has zero of twenty validators built; §16 has four staged rules and says none may be staged twice. At two rules a quarter the suite completes in 2029 and the automation gate never opens.

**All rolling-window statistical detectors.** Flesch-Kincaid readability bands over 8 editions; archive self-similarity collapse; n-gram originality as a publish blocker. Three separate failures: the readability band penalises the variation §8 *requires*; the self-similarity floor points the wrong way against our own measured corpus (Epic 7's problem is overlap too **high** — 62.5%); the originality gate would fail every compliant edition, because the sentences it flags are the §5 standing text and §7 protected phrases we are required to repeat verbatim.

**`constitution-regress.js` — running amended rules backwards over the archive.** The best idea in the governance document, and it kills itself on dependencies: it needs a tagged validator set, and Epic 3 has zero of twenty. It would gate the §13 pattern-study amendment — which is *owed* — behind a machine that does not exist. The real insight is already handled where it has actually happened: methodology v3 moved 180 archived months and was quantified in public in `data/revisions.json` and `policies.html#data`. **Revisit after Gate 2 passes.**

**Editorial rule history section on `policies.html`.** A version table with exactly one row, for a document that has had zero amendments. The genuine gap inside it — readers see methodology history but have no pointer to the rulebook — costs one clause and is folded into 3.4's `policies.html` copy.

**Translation containment validator.** Checks a section that does not exist: `reports/editions/2026-08-03/edition.json` contains nine invented block names and zero of the seven canonical ones (board finding C11). Prerequisite is D-7 making the household translation a required schema field, which is already open. It also fails the standing test — no demonstrated shipped falsehood. Let 3.2's `shouldHaveBeenCaughtBy` counter decide its priority, not a reader's intuition.

**Delta computed twice (as-originally-reported vs as-currently-known).** The premise checks out — four v2 vintages read 27/30, the v3 vintage reads 26/29, and for June both bases give −3. That is one reassuring sentence, bought with a new packet field, a §5 amendment, and a **fifth** entry in §16 while four staged rules sit unimplemented and §16 says no rule may be staged twice. Right idea, wrong quarter.

**"Cite this reading" vintage permalink.** Nearly adopted; killed on a detail every reader missed. `data/latest.json` records `collection.vintageRetentionPolicy: "retain-all-unique-schema-v3-manifests"` — the retention promise is scoped to fingerprint schema v3. Publishing *"This file never changes"* before verifying the four v2 vintages survive the next schema bump is an unearned disclosure of exactly the kind §14 exists to prevent. **Fix the retention policy first, then ship the line.** This is the strongest item on the rejected list and the first candidate for promotion.

**Marketing the observed-value rule, or comparing our rigor to Chartr's.** The Chartr claim is built on a failed fetch — the document could not read their methodology page and converted that into a claim about their rigor. Unfalsifiable comparative assertion about a third party, on the one surface whose purpose is that we do not do that. And premature: D-1 documents three of seven live household lines that still cannot satisfy §4, and 3.1 above adds two more.

**`revision_status` field ("final"/"preliminary"/"flash") and the 8-day staleness qualifier.** The first would print "final" seven times out of seven, every week — furniture pretending to be a disclosure. The second would stamp "(preliminary)" on correct, final, on-schedule quarterly prints 52 weeks a year; credit and auto are 214 days old and entirely current. C4's whole finding is that observation age and provisionality are different predicates.

**Annual "Wheel of Misfortune" replay.** Every agent session here starts cold with no memory. The replay runs continuously and involuntarily. The observed failure mode is the inverse — cold-start agents re-proposing shipped work, which is why this triage exists.

**Quarterly corrections-review meeting.** One real edition exists. The review layer is already heavier than proposed. Revisit when Gate 3 passes and the log has entries.

---

## 5. CONFLICTS

Twenty-two conflicts were flagged across the six documents. The readers took the right side on all twenty-two. Four are worth recording here because a future session will meet them again.

**5.1 — "Archived editions are never recalculated; a source revision is footnoted, not restated."** Contradicts `policies.html` §Data policy and Constitution §10. **We win, and it is not close.** The verdict line — the one sentence a reader repeats — is a percentile against all 281 months. That number is only meaningful if all 281 sit on one basis. A history that is part old-vintage and part new-vintage cannot produce an honest percentile. What we do instead is recompute everything and quantify the movement in public — 180 months, max 2 points, 9 band flips — which is strictly more information than a footnote. The document's underlying *distinction* is right and we hold it in a sharper three-way form (source revision · methodology recalibration · our own error, per D-5).

**5.2 — "Replace a retracted edition's page with a withdrawal notice; edit corrected editions in place with strikethrough."** Contradicts `EDITION-CHANGELOG.md` header and standing rule 4. **We win.** Replacing a page destroys the artifact a skeptical reader needs, and this product's differentiator is that the artifact survives the error. Epic 7 also treats the archive as the regression suite — a replaced page is a deleted test. `2026-08-04/edition.txt:127` already states the house position: "Last week's edition stays up, unedited. We correct in public or it doesn't count." Narrow concession: §15's "linked from every corrected report" means appending a pointer is permitted; altering substance is not.

**5.3 — "Ban the words 'revision' and 'recalculation'; every correction must carry the literal word Correction."** Contradicts §5 and `data/revisions.json`. **The intent wins; the lexical ban loses.** AP's rule exists to stop an error being disguised as housekeeping, and §5 already closes that loophole more precisely: "A reconciliation sentence is only ever written about a revision that actually happened; it is never used to paper over an arithmetic error." But "revision" and "recalibration" are load-bearing *true* words here — they name two real non-error categories the document's taxonomy has no bucket for, one of which (methodology v3) is one of the two corrections in the Aug 4 re-issue. Banning the vocabulary would force a genuine recalibration to be mislabelled a Correction: a different lie in the opposite direction. Enforce the intent as the root-cause enum in §4 above, not as a word blacklist.

**5.4 — "No amendment from a single incident; require two independent recurrences."** Contradicts §5, which cites single incidents as its own source, and CODEX-DIRECTION's standing test ("A validator is worth building if, and only if, it would have caught something a reader could have caught"). **We win.** Under the recurrence gate, "breadth was unchanged" — one occurrence, disproved in ninety seconds by the operator's own commit title — would be logged and not promoted. A rule requiring two occurrences is a rule that publishes the second error on purpose. **Small live rule worth writing down when the case first arises:** an amendment proposed *autonomously by an agent from log pattern-matching* needs two independent recurrences; an operator amendment following a published correction needs none. Recurrence count belongs in the *ordering* of the validator queue (3.2), not in the gate that admits work to it.

**5.5 — "The Constitution and its validators must be tagged as one atomic unit, never versioned independently."** Flagged as conflicting with §16, which permits a rule to be ADOPTED while no engine emits it. **This conflict dissolves under 3.7.** Once `stagedRules` is a field in the validation record, §16 stops being an exception to the version stamp and becomes part of what the stamp carries — the record states which rules were knowingly not enforced on that edition. No side needs to lose.

**5.6 — "OOZEMeter's publish gate matches the newsroom pattern well already: single named human, hard gate, no override path."** Contradicts the observed record. **The record wins, and this is the most important conflict on the list.** `approval.json` is not merely imprecise; it is the record of an override the artifact set cannot represent. 3.5 is the fix. Nobody reading that document should conclude the publish gate is solved.

---

## 6. THE ONE THING

**Ship §3.1 — D-9.**

Everything else on this list is governance improving governance: better records of what we did, better disclosure of who wrote what, better ordering of work not yet built. Valuable, and all of it survives prosecution. But D-9 is the only item where **a number we have published to readers may not be the number our own methodology says it is** — and where the packet that is supposed to prove it actively describes the wrong input.

`scripts/collect.js:108` and `:110` score jobs and housing as `Math.max()` over two competing series, and the packet prints the first candidate unconditionally. In June, unemployment happened to bind, so D-1's reproduction table shows jobs matching exactly and everyone moved on. **That is luck, and it is why four adversarial passes — a four-officer board review, a Chair re-derivation, D-0 through D-8, and six research documents — all missed it.** In any month where claims or mortgage delinquency binds instead, we published an observed value that did not produce the score, under a rule (§4) that says in so many words "the observed value **that produced its score**," with a perfectly correct date attached, and with a full evidence packet certifying it.

That is the failure the entire product exists to make impossible. Every other item on this list makes us better at *telling* readers when we were wrong. D-9 is the one that makes us right.

Second and third, in order, once D-9 is specified: **§3.6** (an hour's work, three live violations on published pages) and **§3.3** (one operator commit that closes three amendments at once and unblocks the corrections emitter). §3.4's page copy should go out in the same week — it is currently a false statement about ourselves on a governance page, which is the exact defect class that failed both board reviews.

---

**Operator decisions required under §14:** two commits — the §15 three-clause amendment (3.3) and the §4 byline clause (3.4). Everything else is a pipeline task with a named owner.

---

## Per-document headlines

**corrections** (adopted 3, already covered 12)

The one mechanism here that OOZEMeter has nothing like is Rule 3.2's regression check — a validator that fails the build when a draft restates a framing or number a prior correction retracted. It maps to a failure that actually happened: `reports/editions/2026-08-03/edition.txt:25` shipped "while breadth was unchanged" *after* the 2026-08-02 fix that was supposed to make that impossible, and the Aug 4 re-issue — the edition written to correct Aug 3 — reproduced Aug 3's own employment-rank error verbatim. Everything else is either already in Constitution §15 / Hermes Epic 4, or is newsroom triage machinery built to ration scarce editor attention across many stories, which is not this product's constraint; and the doc's five-tier ladder has no bucket at all for a methodology recalibration, which is what one of the two corrections in the Aug 4 re-issue actually is.

**governance** (adopted 4, already covered 12)

The document's one durable contribution is the retroactive regression gate: before a rule change merges, run the NEW rule set backwards over every archived edition and enumerate which past editions it condemns — which, for a publication whose product is public corrections, converts an amendment into a measurable correction obligation rather than a quiet reset. It also assumes infrastructure we do not have: it states "every archived edition already carries a `constitution_version` field in its evidence packet," but this repo has zero git tags, zero references to that field, and `edition.json`/`evidence.json` carry only `schemaVersion` and `methodologyVersion` — so no reader can currently tell which rule set governed the August 3 edition versus its August 4 re-issue. Everything else is either already locked in §14/§16 and the Hermes roadmap, or newsroom governance furniture (committees, comment periods, cooldowns, reader proposal channels) built for staff and an audience that do not exist.

**ai-gov** (adopted 3, already covered 12)

The one load-bearing recommendation in this document is E-4 ("if generative AI played a material role... this should be disclosed in the edition itself"), and applying it exposes a live falsehood on our own governance pages: about.html:38 and policies.html:35 publish a two-category taxonomy — deterministic OOZEBOT vs. human "operator dispatch" — with no category for the model-drafted weekly editions we are actually producing, and reports/editions/2026-08-04/edition.txt signs "Drafted by OOZEBOT," the engine about.html defines as "a deterministic script, not a chatbot." Everything else in Part 2 is either already shipped (scripts/weekly-deliver.js enforces E-7 more strictly than the report asks, binding approval to SHA-256 of edition + evidence, not just a commit) or already scheduled (HERMES-IMPLEMENTATION-ROADMAP Epics 3/6/7). Take Part 2's principles, not its instructions: it is an "Operating Manual — Effective This Edition Forward" written against a repo that does not exist here (scoring/score.py, validators/*.py, make validate, publish.sh, archive/YYYY-WW/, #oozemeter-approvals), and it cites three rules as "the existing project design" — one-amendment-per-month rate limiting, skills.write_approval, constitution/validator git-tag pinning — that appear nowhere in our files.

**newsroom** (adopted 3, already covered 12)

The one control in this document we do not have in any form is AP's 2016 rule that a correction must re-enter the same distribution channel the error went out on — and we are currently in violation of it in the live record: the August 3 edition was delivered by email (research/WEEKLY-CHANNELS.md, "delivered successfully"), while the correction sits as reports/editions/2026-08-04/edition.txt marked DRAFT. Everything else of substance restates the three-gate model, Epic 3's validator list, or D-0 through D-4, and the document's implementation table maps onto a validators/*.py + Makefile + Discord-channel architecture that does not exist in this repo. Second-most-valuable item is a factual error it makes about us: it praises our publish gate for having "no override path for validator failures" when reports/editions/2026-08-03/approval.json literally reads "Arrington (explicit ship-now instruction)" — the override happened and nothing in the artifact set records it as one.

**datajourn** (adopted 5, already covered 12)

The one genuinely transferable mechanism is Our World in Data's archived-vs-live split: a citation must resolve to a frozen artifact because the live number is allowed to move. We already generate the frozen artifacts — `data/vintages/<fingerprint>.json` and immutable edition folders — and board finding P1/C14 verified nothing reader-facing links them, which is why the June 27→26 restatement left anyone who cited 27 with nothing to point at. The rest of §6 either restates §4 verbatim, contradicts §6's locked anatomy, or builds on files absent from this repo (`no_unsupported_claims.py`, `score_bounds.py`, and all seven §6 paths) — but taking its central question literally against `scripts/collect.js` surfaced a §4 violation nobody has found: jobs and housing score as `Math.max()` over two competing series and the packet always prints the first one.

**memory** (adopted 3, already covered 12)

Part 1 (the cross-domain survey of NYT/AP, ASRS, NICE/M&M, Google SRE) is sound and well-sourced. Part 2 is addressed to a repository that does not exist: it asserts "OOZEMeter's existing substrate already contains analogues of every mechanism above" and then names `archive/corrections.jsonl`, `archive/style-metrics.jsonl`, six Python validators (`no_unsupported_claims.py`, `score_bounds.py`, `honesty_constitution.py`, `do_not_build.py`, `style_consistency.py`, `plagiarism_vs_archive.py`), `MEMORY.md`/`USER.md` and `session_search` — none of which are in the tree (no `archive/`, no `.jsonl` anywhere, the pipeline is Node, and the only Python wired as a gate is `research/household_v2_baseline.py` at `scripts/weekly-package.js:32`). `corrections.jsonl` is planned, unbuilt (Epic 4 / D-0); `style-metrics.jsonl` and the validator names are invented. The one durable idea worth extracting is the third cross-domain finding — precedent must be pushed at the point of use, not filed — and OOZEMeter already has exactly the substrate to implement it that the document never mentions: 49 keyed facts in `evidence.json` and every prose unit bound to `claimIds` in `edition.json`, including the real key `market.breadth.delta` whose published value of 0 was the false sentence.