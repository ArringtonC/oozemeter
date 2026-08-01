# Methodology v3 pipeline handoff — publication remains blocked

The operator-approved data-pipeline batch is ready for front-end review. It is
not a publication approval. The mandatory disclosure and public-surface work in
`research/METHODOLOGY-V3-SPEC.md` §10 must land before the cron is unlocked.

## Canonical inputs for the front-end batch

- `data/latest.json` is the current collector contract, including the weighted
  `financial` line, source provenance, methodology version, and calibration.
- `data/history.json` is the regenerated comparable archive.
- `research/backtest-results.json` is the current-vintage backtest, including
  weights, anchors, methodology details, calibration, stresses, and episode
  history.
- Revision record entry #2 in `data/revisions.json` contains the generated
  archive comparison, band-flip count, and calibration transition.

Do not copy numeric claims from this note. Resolve public numbers from those
canonical artifacts so future source revisions cannot leave prose behind.

## Front-end-owned work still required

- Update `lab.js` weights and add the Financial Conditions indicator definition.
- Update the methodology and policy disclosures, including every mandatory
  limitation in spec §10.
- Regenerate the front-end fallback history and static incident values from the
  canonical archive. They were intentionally left untouched in this pipeline
  batch.
- Reconcile static copy that still describes the prior number of weighted lines
  or prior breadth trigger, including the OOZEMAXING incident article.
- Add the Financial Conditions name and value clause to the OOZEBOT narrative
  template.
- Distinguish methodology recalibrations from source-revision events in the
  OOZEBOT confidence sentence; the revision ledger now contains both types.
- Correct the Ward credit-and-funding FAQ that still describes NFCI as outside
  the household flagship.
- Update the public intake data map so its formula status and source table include
  Financial Conditions.
- Satisfy the v3 release inspector only after the disclosure, labels, revision
  summary, and public artifacts are internally consistent.

The release inspector recognizes the v3 pipeline and schema, but intentionally
rejects the current canonical tree until those front-end requirements are met.
That failed inspection is the publish blocker working as designed; do not bypass
it.
