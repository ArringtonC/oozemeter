#!/usr/bin/env node
/* Critic: attack the published payload, not the library.

   The unit tests exercise functions. This runs the real `scripts/claim-gate.js`
   against a mutated `data/editorial.json`, which is what actually ships. Every
   mutation below is a lie a careless edit or a future generator could tell.

   Restores the file in a finally block. Verify with `git status` after. */
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const {attack, report} = require('./harness');

const repo = path.resolve(__dirname, '..');
const P = path.join(repo, 'data/editorial.json');
const original = fs.readFileSync(P, 'utf8');

/* run the real gate; true = it refused (exit non-zero) */
function gateRefuses(mutate) {
  const doc = JSON.parse(original);
  mutate(doc);
  fs.writeFileSync(P, JSON.stringify(doc, null, 1));
  try {
    execFileSync(process.execPath, ['scripts/claim-gate.js'], {cwd: repo, encoding: 'utf8'});
    return false;                       // gate passed — the lie got through
  } catch { return true; }              // gate exited non-zero — refused
}

try {
  /* baseline: the honest payload must PASS, or every result below is noise */
  attack('the unmutated payload passes', {
    input: 'no mutation', expected: false, actual: gateRefuses(() => {}),
    falseClaim: 'n/a — a gate that fails on truth is a gate nobody keeps',
    rootCause: 'over-strict rule'});

  /* a row claiming agreement the deltas do not support */
  attack('flip a row to "agrees" against its own deltas', {
    input: 'rows[jobs].result = agrees', expected: true,
    actual: gateRefuses(d => { const r = d.crosschecks.rows.find(x => x.slug === 'jobs'); if (r) r.result = 'agrees'; }),
    falseClaim: '"employment and industrial production agree this month"',
    rootCause: 'gate trusts the published state instead of recomputing it'});

  /* the headline claiming quiet while a row is stale */
  attack('module reads quiet while a row is stale', {
    input: 'crosschecks.state = quiet', expected: true,
    actual: gateRefuses(d => { d.crosschecks.state = 'quiet'; }),
    falseClaim: '"The checks agree" printed over a check that could not run',
    rootCause: 'headline state not derived from row states'});

  /* an unchecked row that names a comparison it never made */
  attack('unchecked row given a comparison series', {
    input: 'rows[housing].against = "Industrial production"', expected: true,
    actual: gateRefuses(d => { const r = d.crosschecks.rows.find(x => x.slug === 'housing'); if (r) r.against = 'Industrial production'; }),
    falseClaim: '"housing was checked against industrial production" — it was not',
    rootCause: 'no invariant tying result=not-checked to the absence of a comparison'});

  /* a state word the vocabulary does not contain */
  attack('invented result vocabulary', {
    input: 'rows[jobs].result = "broadly fine"', expected: true,
    actual: gateRefuses(d => { const r = d.crosschecks.rows.find(x => x.slug === 'jobs'); if (r) r.result = 'broadly fine'; }),
    falseClaim: 'an unvalidated state word rendered as a verdict',
    rootCause: 'open vocabulary — any string reaches the page'});

  /* a brand-new reader-facing field nobody taught the gate about */
  attack('orphaned narrative surface', {
    input: 'editorial.marketOutlook = "…"', expected: true,
    actual: gateRefuses(d => { d.marketOutlook = 'Conditions look likely to improve into September.'; }),
    falseClaim: 'an ungated forecast on a facility that does not forecast',
    rootCause: 'surface registry not enforced'});

  /* ---- the softer surfaces: prose ABOUT the checks ---- */
  attack('count line contradicts the rows', {
    input: 'crosschecks.count = "0 of 1 checks disagree"', expected: true,
    actual: gateRefuses(d => { d.crosschecks.count = '0 of 1 checks disagree'; }),
    falseClaim: 'a reassuring tally over a check that never ran',
    rootCause: 'the count string is prose the gate never reconciles with the rows'});

  attack('coverage note claims full coverage', {
    input: 'crosschecks.note = "All 7 weighted lines carry a comparison series."', expected: true,
    actual: gateRefuses(d => { d.crosschecks.note = 'All 7 weighted lines carry a published comparison series.'; }),
    falseClaim: '"all 7 lines are checked" when 6 have no comparison series at all',
    rootCause: 'the coverage note is prose the gate never reconciles with the rows'});

  attack('label claims agreement over a stale check', {
    input: 'crosschecks.label = "The checks agree"', expected: true,
    actual: gateRefuses(d => { d.crosschecks.label = 'The checks agree'; }),
    falseClaim: '"The checks agree" as the headline of a month nothing could be checked in',
    rootCause: 'the human-readable label is not tied to the canonical state'});
} finally {
  fs.writeFileSync(P, original);
}

report('critic_surface');
