#!/usr/bin/env node
/* ============================================================
   CLAIM GATE — CLI. Runs after story.js, before publication.

   Validates the claims OOZEBOT actually emitted, against the dependency graph
   and the ten rules in lib/claim-gate.js. Exits 1 on any violation.

   This is the gate that would have stopped D1 and D2. Both are permanent
   fixtures in tests/claim-gate.test.js; this CLI is what runs in the cron.
   ============================================================ */
const fs = require('fs');
const CG = require('./lib/claim-gate');
const DG = require('./lib/dependency-graph');

const graph = DG.loadGraph();
const editorial = JSON.parse(fs.readFileSync('data/editorial.json', 'utf8'));
const latest = JSON.parse(fs.readFileSync('data/latest.json', 'utf8'));

const fail = [];
const warn = [];
const weights = Object.fromEntries(Object.entries(latest.lines || {})
  .map(([k, l]) => [k, l.scoreWeight !== undefined ? l.scoreWeight : (l.contributesToOoze === false ? 0 : (l.weight || 0))]));

/* ---- RULE 10: PUBLIC-SURFACE COVERAGE -----------------------------------
   Every narrative field on the editorial payload must be registered. When
   crosschecks was added it became a reader-facing surface that no gate read;
   the next one must not be able to do that quietly. */
const REGISTERED_SURFACES = new Set([
  'month', 'monthLabel', 'generated', 'byline', 'articleSlug',
  'verdict', 'summary', 'story', 'lines', 'confidence',
  'crosschecks', 'newsletter', 'rssSummary', 'social',
]);
for (const key of Object.keys(editorial)) {
  if (!REGISTERED_SURFACES.has(key)) {
    fail.push({rule: 'R10-COVERAGE', message:
      `unregistered narrative surface "${key}" on data/editorial.json — it reaches readers and no gate validates it. ` +
      `Register it in scripts/claim-gate.js REGISTERED_SURFACES and give it a validation path.`});
  }
}

/* ---- the cross-check claims -------------------------------------------- */
const cc = editorial.crosschecks;
if (cc) {
  const STATE_FOR = {agrees: 'AGREES', mixed: 'MIXED', disagrees: 'CONFLICT',
    'not checked': 'UNCHECKED', stale: 'STALE', insufficient: 'INSUFFICIENT'};

  for (const row of (cc.rows || [])) {
    const state = STATE_FOR[row.result];
    if (!state) {
      fail.push({rule: 'R3-STATE', message: `row "${row.slug}" has unmapped result "${row.result}"`});
      continue;
    }

    /* An unchecked row must not carry a comparison, and must never be counted
       as agreement anywhere downstream. */
    if (state === 'UNCHECKED') {
      if (row.against) fail.push({rule: 'R3-STATE', message: `row "${row.slug}" is "not checked" yet names a comparison series (${row.against})`});
      continue;
    }

    const primary = latest.lines[row.slug];
    const diagnostic = latest.lines[row.againstSlug];
    if (!primary || !diagnostic) {
      fail.push({rule: 'R3-STATE', message: `row "${row.slug}" references a line missing from data/latest.json`});
      continue;
    }

    /* Recompute the state from the raw payload. If the published state and the
       independently recomputed state differ, prose has decided something the
       data does not support — which is the entire failure class this gate
       exists for. */
    const recomputed = CG.classifyRelationship({
      primaryDelta: primary.delta,
      diagnosticDelta: diagnostic.delta,
      threshold: cc.threshold,
      expected: 'same',
      primaryStale: !!primary.stale,
      diagnosticStale: !!diagnostic.stale,
    });
    if (recomputed !== state) {
      fail.push({rule: 'R3-STATE', message:
        `row "${row.slug}" publishes ${state} but the payload recomputes to ${recomputed} ` +
        `(primary delta ${primary.delta}, diagnostic delta ${diagnostic.delta}, threshold ${cc.threshold})`});
    }

    const result = CG.validateClaim({
      claimId: `crosscheck:${row.slug}`,
      claimType: 'CROSS-CHECK',
      state,
      primarySlug: row.slug,
      diagnosticSlug: row.againstSlug,
      independenceRequired: true,
      diagnosticContributesToOoze: false,
      primaryPeriod: (primary.asOf || '').slice(0, 7),
      diagnosticPeriod: (diagnostic.asOf || '').slice(0, 7),
      vintageMismatchAllowed: true,
      vintageDisclosure: cc.note || null,
      primaryName: row.name,
      diagnosticName: row.against,
      surfaces: {body: (cc.body || []).join(' '), rule: row.rule},
    }, {graph, weights});

    for (const v of result.violations) {
      fail.push({rule: v.rule, message: `crosscheck:${row.slug} — ${v.message}`, detail: v.detail});
    }
  }

  /* RULE 3 at the module level: the headline state must follow from the rows,
     with no path that turns "nothing fired" into agreement. */
  const rowStates = (cc.rows || []).map(r => STATE_FOR[r.result]).filter(Boolean);
  const anyConflict = rowStates.includes('CONFLICT');
  const anyMixed = rowStates.includes('MIXED');
  const anyChecked = rowStates.some(s => s !== 'UNCHECKED');
  const anyUnrunnable = rowStates.some(s => s === 'STALE' || s === 'INSUFFICIENT');
  const expectedHead = !anyChecked ? 'nodata' : anyConflict ? ['red', 'amber']
    : anyMixed ? ['mixed'] : anyUnrunnable ? ['stale'] : ['quiet'];
  const heads = Array.isArray(expectedHead) ? expectedHead : [expectedHead];
  if (!heads.includes(cc.state)) {
    fail.push({rule: 'R3-STATE', message: `module state "${cc.state}" does not follow from row states [${rowStates.join(', ')}] (expected one of ${heads.join(', ')})`});
  }

  /* RULE 6: nothing stale may read as confirmation. */
  if (rowStates.includes('STALE') && ['quiet'].includes(cc.state)) {
    fail.push({rule: 'R6-STALENESS', message: 'a stale row is present but the module reads as agreement'});
  }

  /* ---- RULE 4, applied to the strings a reader actually reads --------------
     Found by gauntlet/critic_surface.js on its first run. The gate validated
     `state` and left `label`, `count` and `note` unchecked — so the payload
     could carry state:"stale" while the headline said "The checks agree", the
     tally said "0 of 1 checks disagree", and the coverage note claimed all
     seven lines were covered. All three passed. A reader sees the prose, not
     the enum; guarding only the enum guards the wrong half. */
  const counted = {
    checked: rowStates.filter(s => s !== 'UNCHECKED').length,
    unchecked: rowStates.filter(s => s === 'UNCHECKED').length,
    conflict: rowStates.filter(s => s === 'CONFLICT').length,
    mixed: rowStates.filter(s => s === 'MIXED').length,
    unrunnable: rowStates.filter(s => s === 'STALE' || s === 'INSUFFICIENT').length,
  };

  /* the headline may only claim agreement when every check actually agreed */
  const claimsAgreement = /\bagree/i.test(String(cc.label || ''));
  if (claimsAgreement && cc.state !== 'quiet') {
    fail.push({rule: 'R4-SAME-STATE', message:
      `headline "${cc.label}" claims agreement, but the module state is "${cc.state}" ` +
      `(rows: ${rowStates.join(', ')})`});
  }

  /* the tally must describe the rows. "N of M <verb>" is reconciled against the
     row counts for whichever verb it uses. */
  const tally = String(cc.count || '').match(/(\d+)\s+of\s+(\d+)\s+check/i);
  if (tally) {
    const [, nRaw, mRaw] = tally;
    const n = +nRaw, m = +mRaw;
    if (m !== counted.checked) {
      fail.push({rule: 'R4-SAME-STATE', message:
        `tally "${cc.count}" says ${m} check(s) ran, but ${counted.checked} row(s) were checked`});
    }
    const saysDisagree = /disagree/i.test(cc.count);
    const saysUnrunnable = /could not run|stale|insufficient/i.test(cc.count);
    const verb = saysDisagree ? counted.conflict
      : /mixed/i.test(cc.count) ? counted.mixed
      : saysUnrunnable ? counted.unrunnable : null;
    if (verb !== null && n !== verb) {
      fail.push({rule: 'R4-SAME-STATE', message:
        `tally "${cc.count}" states ${n}, but the rows give ${verb}`});
    }
    /* Arithmetically true is not the same as honest. "0 of 1 checks disagree"
       adds up when the one check never ran, or came back mixed — and either way
       it reads as a clean result. The tally's VERB has to describe what the
       month actually was.

       The first version of this rule only covered the unrunnable case, because
       that was the live state the day it was written. gauntlet/critic_surface
       caught the gap the moment the feed refreshed and the state moved to
       mixed. Generalised: whatever the loudest thing in the roster is, the
       tally has to be about that. */
    const loudest = counted.conflict ? 'disagree'
      : counted.mixed ? 'mixed'
      : counted.unrunnable ? 'unrunnable' : 'agree';
    const describes = {disagree: saysDisagree, mixed: /mixed/i.test(cc.count),
      unrunnable: saysUnrunnable, agree: true}[loudest];
    if (!describes) {
      const found = {disagree: `${counted.conflict} disagreeing`, mixed: `${counted.mixed} mixed`,
        unrunnable: `${counted.unrunnable} unrunnable`}[loudest];
      fail.push({rule: 'R4-SAME-STATE', message:
        `tally "${cc.count}" does not describe the month: the roster has ${found} check(s), ` +
        `and a tally that reports on something else reads as a clean result`});
    }
  }

  /* the coverage note may not claim more coverage than the roster shows */
  const note = String(cc.note || '');
  if (counted.unchecked > 0 && /\ball\b[^.]*comparison series/i.test(note)) {
    fail.push({rule: 'R4-SAME-STATE', message:
      `coverage note claims every line carries a comparison series, but ${counted.unchecked} row(s) are unchecked`});
  }
  const noteNum = note.match(/(\d+)\s+of\s+the\s+(\d+)\s+weighted lines carry no/i);
  if (noteNum && +noteNum[1] !== counted.unchecked) {
    fail.push({rule: 'R4-SAME-STATE', message:
      `coverage note says ${noteNum[1]} line(s) uncovered, but the roster shows ${counted.unchecked}`});
  }
}

/* ---- report -------------------------------------------------------------- */
warn.forEach(w => console.warn('⚠', w.message));
if (fail.length) {
  console.error(`CLAIM GATE: FAIL (${fail.length})`);
  for (const f of fail) {
    console.error(`✗ [${f.rule}] ${f.message}`);
    if (f.detail) console.error(`    ${f.detail}`);
  }
  process.exit(1);
}
const checked = (editorial.crosschecks?.rows || []).filter(r => r.result !== 'not checked').length;
console.log(`claim gate: PASS — ${Object.keys(editorial).length} registered surfaces, ${checked} cross-check claim(s) independence-proven, states recomputed from payload`);
