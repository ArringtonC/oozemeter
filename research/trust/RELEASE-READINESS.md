# Release readiness — the Claim Gate

**Date:** 2026-08-15 · **Branch:** `claim-gate` · **Scope:** P0 truth infrastructure

---

## The final question

> Can a gate-green OOZEMeter build still publish an economic statement that
> contradicts the data or dependency structure known to the repository?

## **PROBABLY NOT, WITH KNOWN GAPS**

Not the strongest answer, and it would be dishonest to claim it. What is now
structurally impossible is narrow and real; what remains possible is listed
below in full.

---

## What is now impossible

Each of these is enforced by a test that fails the build, and each corresponds
to a falsehood that actually reached a reader or would have.

| Failure | Mechanism | Test |
|---|---|---|
| **D1** — a cross-check whose "independent" diagnostic is an input to the primary sensor | recursive upstream traversal with alias resolution; a non-independent pair is `INVALID`, not reworded | `D1: housing cannot be cross-checked against mortgage delinquency` |
| **D1'** — publishing "the jar does not read X" when it does | negative-dependency phrases require `independenceRequired` and graph proof | `D1: the negative claim … is refused` |
| **D2** — opposite directions below threshold printed as agreement | `classifyRelationship` enumerates every directional case; nothing falls through to AGREES | `D2: no branch … silently inherits AGREES` |
| **Transitive circularity** | gas is CPI-deflated, so CPI is upstream of gas without appearing in any sentence about gas — caught by traversal, not by naming | `transitive circularity is caught: gas shares CPI with inflation` |
| **Stale confirmation** | a stale series on either side returns `STALE`, never `AGREES` | `a stale diagnostic can never read as agreement` |
| **Signed-zero months** | flat is neutral; the payload is scanned for `▲ +0` / `▼ −0` | `a flat month is neutral, never a signed zero` |
| **Accessibility divergence** | surfaces are compared on canonical state, not wording | `visible MIXED with screen-reader AGREES fails validation` |
| **Orphaned narrative surface** | any unregistered key on `editorial.json` fails the gate | `an unregistered narrative surface fails the gate` |
| **State drift between prose and payload** | the gate recomputes every published state from `data/latest.json` and rejects mismatches | `the published payload passes the claim gate` |

**17 regression tests. 30/30 test files pass. The gate runs in the daily cron
after `story.js` and before `narrative-check.js` and `stamp.js`.**

The dependency graph carries 215 nodes, 398 edges, 112 alias mappings and 15
machine-checkable assertions, all passing. Independence is never inferred from
naming — it is proved by traversal, and the proof path is recorded on the claim.

### One rule was deliberately narrowed

The first causal-language rule flagged every `because` in the payload. Its first
catch was a **true** sentence — *"We are showing this rather than filing it under
agreement, because they did not agree"* — which describes an editorial decision,
not an economic mechanism. A rule that rejects true sentences gets switched off,
so R7 now fires only where a causal verb links **both economic subjects** inside
one sentence. Both the true positive and the true negative are tests.

---

## Remaining paths by which a false claim could still ship

Listed in descending order of risk. This is the honest answer to the final
question.

1. **Only cross-check claims are gated.** `EDITORIAL.story`, `summary`,
   `verdict`, `confidence`, the per-line sentences, indicator-page prose, article
   and report copy are covered by `narrative-check.js` (tokens, score literals,
   archive reconciliation) but **not** by the Claim Gate. The eight false
   statements found on the indicator pages earlier in this programme were exactly
   this class. *Narrative migration (P1) is not done.*

2. **`story.js` still decides its own states.** The gate **recomputes** each state
   from the payload and rejects mismatches, which is a strong safety net — but
   truth determination has not actually moved upstream. Logic smells such as
   `if delta > 0 → improving` remain in the generator. A defect that produces the
   *same* wrong state in both places would pass.

3. **Accessibility equivalence is asserted on claim objects, not on the rendered
   DOM.** The test proves the *function* rejects divergence. It does not crawl
   `index.html` and diff visible text against `aria-label`/`sr-only` output. A
   hand-written aria string can still contradict the page.

4. **No historical replay.** The gate has only ever seen July 2026. Months where
   "agrees" would later look unjustified, or where a diagnostic would not have
   been available on publication day, are untested. The repo's backtest is
   `realTimeCompatible: false`, so this needs ALFRED vintages to do properly.

5. **The economic prior is hand-declared.** `expected: 'same'` vs `'inverse'` is
   set per pair by a human. Declaring it backwards would invert every verdict for
   that pair, and nothing checks it against economic reality.

6. **Only one cross-check exists.** `jobs ↔ manufacturing`. Six of seven weighted
   lines have no published comparison series, so the module's coverage is thin —
   honestly disclosed as "not checked", but thin.

7. **The graph is generated, not continuously verified.** If `collect.js` gains a
   new input and nobody regenerates `dependency-graph.json`, independence proofs
   silently go stale. There is no test asserting the graph matches the code.

8. **Ward M, sector, states and personal surfaces are outside the gate entirely.**

9. **Vintage checking is shallow.** It compares `asOf` month strings. It does not
   detect revised-vs-unrevised data within the same month.

---

## What the brief asked for and did not get built

The 12-agent chain stalled at agent 3 — the artifacts from agents 1 and 2
(159 KB graph, 73 KB surface map) exhausted the context of an agent that then
tried to `cat data/latest.json` on top of them. Agents 1, 2 and the gate,
truth table, fixtures and CI wiring were completed; the rest were not.

| Artifact | Status |
|---|---|
| `DEPENDENCY-GRAPH.md` + `dependency-graph.json` | **done** (agent 1) |
| `CLAIM-INVENTORY.md` + `claim-surfaces.json` | **done** (agent 2) |
| `CLAIM-GATE-SPEC.md` | this document + inline rationale in `lib/claim-gate.js` |
| `CROSSCHECK-TRUTH-TABLE.md` | **partial** — the table exists as executable cases in `claim-gate.test.js`, not as a document |
| `CLAIM-SCHEMA.md` / `claim.schema.json` | **not built** — the Claim object is defined by `validateClaim`'s contract, not by a JSON Schema |
| `ADVERSARIAL-FAILURES.md` | **not built** — no red-team pass ran |
| `ACCESSIBILITY-TRUTH-AUDIT.md` | **not built** |
| `HISTORICAL-CLAIM-REPLAY.md` | **not built** |
| `CI-COVERAGE.md` | this document's first table |
| `IMPLEMENTATION-CHANGELOG.md` | the commit message |

**No adversarial red-team pass has been run against this gate.** Every prior
stage of this programme found real defects only at the adversarial step —
including two in the work that produced this gate's own subject matter. The
absence of that pass is the single largest reason the answer above is not
"NO, WITH TESTED GUARANTEES".

---

## Recommended next steps, in order

1. **Red-team the gate.** Every attack in the brief: aliases, transitive
   dependencies, rounding boundaries, reordered arrays, cache and offline state.
   Turn each success into a fixture.
2. **Assert the graph against the code.** A test that regenerates
   `dependency-graph.json` from `collect.js` and fails on drift. Without it the
   independence proofs decay silently.
3. **Migrate `story.js` onto claim objects** so the generator receives a state
   and chooses only how to say it.
4. **Crawl the rendered DOM** for accessibility equivalence rather than trusting
   claim objects.
5. **Historical replay** with ALFRED vintages where they exist, and an explicit
   statement of where they do not.
