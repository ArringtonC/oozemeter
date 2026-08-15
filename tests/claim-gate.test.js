/* Regression fixtures for every falsehood adversarial review has caught, plus
   the special tests from the trust-layer brief. Each of these shipped, or would
   have shipped, past a green CI. They are permanent now. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const CG = require('../scripts/lib/claim-gate');
const DG = require('../scripts/lib/dependency-graph');
const repo = path.resolve(__dirname, '..');
const graph = DG.loadGraph();

/* ============ D1 — CIRCULAR DIAGNOSTIC ============================== */
test('D1: housing cannot be cross-checked against mortgage delinquency', () => {
  const ind = CG.verifyIndependence(graph, 'housing', 'foreclosures');
  assert.equal(ind.verified, false, 'mortgage delinquency is an input to housing via Math.max');
  assert.ok(ind.sharedSeries.length > 0);
  assert.ok(ind.sharedSeries.some(s => /DRSFRMACBS/.test(s)), `expected DRSFRMACBS in ${ind.sharedSeries}`);

  const result = CG.validateClaim({
    claimId: 'crosscheck:housing', state: 'AGREES',
    primarySlug: 'housing', diagnosticSlug: 'foreclosures',
    independenceRequired: true,
  }, {graph});
  assert.equal(result.state, 'INVALID', 'a non-independent cross-check is INVALID, not merely reworded');
  assert.equal(result.validationStatus, 'REJECTED');
  assert.ok(result.violations.some(v => v.rule === 'R1-INDEPENDENCE'));
});

test('D1: the negative claim "does not read mortgage delinquency" is refused', () => {
  const result = CG.validateClaim({
    claimId: 'crosscheck:housing', state: 'AGREES',
    primarySlug: 'housing', diagnosticSlug: 'foreclosures',
    independenceRequired: true,
    userLanguage: 'The jar reads the 30-year mortgage rate. It does not read mortgage delinquency.',
  }, {graph});
  assert.equal(result.validationStatus, 'REJECTED');
  assert.ok(result.violations.some(v => v.rule === 'R2-NEGATIVE-UNPROVEN' || v.rule === 'R1-INDEPENDENCE'),
    'a negative dependency claim must be proven from the graph');
});

/* ============ D2 — BINARY FALLBACK ================================== */
test('D2: opposite directions below threshold is MIXED, never AGREES', () => {
  /* the exact live values: employment -1, manufacturing +3, threshold 3 */
  assert.equal(CG.classifyRelationship({primaryDelta: -1, diagnosticDelta: 3, threshold: 3}), 'MIXED');
});

test('D2: no branch of the truth table silently inherits AGREES', () => {
  const T = 3;
  const cases = [
    [{primaryDelta: 5, diagnosticDelta: 4}, 'AGREES'],       // same direction, both material
    [{primaryDelta: 1, diagnosticDelta: 2}, 'AGREES'],       // same direction, both small
    [{primaryDelta: 5, diagnosticDelta: -4}, 'CONFLICT'],    // opposed, both material
    [{primaryDelta: -5, diagnosticDelta: 4}, 'CONFLICT'],    // opposed, both material
    [{primaryDelta: -1, diagnosticDelta: 3}, 'MIXED'],       // opposed, one small  (D2)
    [{primaryDelta: 4, diagnosticDelta: -1}, 'MIXED'],       // opposed, one small
    [{primaryDelta: 0, diagnosticDelta: 0}, 'AGREES'],       // both flat
    [{primaryDelta: 0, diagnosticDelta: 4}, 'INSUFFICIENT'], // one flat: no direction to compare
    [{primaryDelta: 4, diagnosticDelta: 0}, 'INSUFFICIENT'],
    [{primaryDelta: NaN, diagnosticDelta: 2}, 'INSUFFICIENT'],
    [{primaryDelta: null, diagnosticDelta: 2}, 'INSUFFICIENT'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(CG.classifyRelationship({...input, threshold: T}), expected,
      `${JSON.stringify(input)} must be ${expected}`);
  }
});

test('an inverse-expectation pair inverts the verdict rather than inheriting it', () => {
  const same = {primaryDelta: 5, diagnosticDelta: 4, threshold: 3};
  assert.equal(CG.classifyRelationship({...same, expected: 'same'}), 'AGREES');
  assert.equal(CG.classifyRelationship({...same, expected: 'inverse'}), 'CONFLICT');
});

/* ============ SPECIAL: TRANSITIVE CIRCULARITY ====================== */
test('transitive circularity is caught: gas shares CPI with inflation', () => {
  /* gas is CPI-deflated, so CPIAUCNS is upstream of gas without appearing in
     any sentence about gas. A shallow check would call these independent. */
  const ind = CG.verifyIndependence(graph, 'gas', 'inflation');
  assert.equal(ind.verified, false, 'CPI is transitively upstream of gas via the deflator');
  assert.ok(ind.sharedSeries.some(s => /CPIAUCNS/.test(s)));
});

test('the published pair is genuinely independent, proven by traversal', () => {
  const ind = CG.verifyIndependence(graph, 'jobs', 'manufacturing');
  assert.equal(ind.verified, true);
  assert.deepEqual(ind.sharedSeries, []);
});

/* ============ SPECIAL: STALE DIAGNOSTIC ============================ */
test('a stale diagnostic can never read as agreement', () => {
  assert.equal(CG.classifyRelationship({primaryDelta: 4, diagnosticDelta: 5, threshold: 3, diagnosticStale: true}), 'STALE');
  assert.equal(CG.classifyRelationship({primaryDelta: 4, diagnosticDelta: 5, threshold: 3, primaryStale: true}), 'STALE');
});

/* ============ SPECIAL: FLAT MONTH ================================== */
test('a flat month is neutral, never a signed zero', () => {
  assert.equal(CG.classifyRelationship({primaryDelta: 0, diagnosticDelta: 0, threshold: 3}), 'AGREES');
  const editorial = JSON.parse(fs.readFileSync(path.join(repo, 'data/editorial.json'), 'utf8'));
  const blob = JSON.stringify(editorial);
  assert.ok(!/▲\s*\+?0\b/.test(blob), 'no "▲ +0" may reach a reader');
  assert.ok(!/▼\s*[-−]?0\b/.test(blob), 'no "▼ −0" may reach a reader');
});

/* ============ SPECIAL: ACCESSIBILITY DIVERGENCE ==================== */
test('visible MIXED with screen-reader AGREES fails validation', () => {
  const eq = CG.verifyNarrativeEquivalence({
    visible: {state: 'MIXED'},
    screenReader: {state: 'AGREES'},
  });
  assert.equal(eq.equivalent, false);

  const result = CG.validateClaim({
    claimId: 'crosscheck:jobs', state: 'MIXED',
    surfaceStates: {visible: {state: 'MIXED'}, screenReader: {state: 'AGREES'}, tooltip: {state: 'MIXED'}},
  }, {graph});
  assert.equal(result.validationStatus, 'REJECTED');
  assert.ok(result.violations.some(v => v.rule === 'R4-SAME-STATE'));
});

test('surfaces may differ in wording while agreeing in state', () => {
  const eq = CG.verifyNarrativeEquivalence({
    visible: {state: 'MIXED'}, screenReader: {state: 'MIXED'}, share: {state: 'MIXED'},
  });
  assert.equal(eq.equivalent, true);
});

/* ============ SPECIAL: ORPHANED PUBLIC SURFACE ===================== */
test('an unregistered narrative surface fails the gate', () => {
  const p = path.join(repo, 'data/editorial.json');
  const original = fs.readFileSync(p, 'utf8');
  try {
    const doc = JSON.parse(original);
    doc.smugglerNote = 'A new reader-facing field that no gate was taught about.';
    fs.writeFileSync(p, JSON.stringify(doc, null, 1));
    let failed = false, out = '';
    try {
      execFileSync(process.execPath, ['scripts/claim-gate.js'], {cwd: repo, encoding: 'utf8'});
    } catch (e) {
      failed = true; out = String(e.stdout || '') + String(e.stderr || '');
    }
    assert.ok(failed, 'the gate must reject an unregistered narrative surface');
    assert.match(out, /R10-COVERAGE/);
    assert.match(out, /smugglerNote/);
  } finally {
    fs.writeFileSync(p, original);
  }
});

/* ============ RULE 7/8 — language may not outrun the state ========= */
test('causal language linking both subjects is refused', () => {
  const v = CG.verifyLanguage('MIXED',
    'Employment fell because industrial production climbed.',
    ['Employment', 'industrial production']);
  assert.ok(v.some(x => x.rule === 'R7-CAUSAL'));
});

test('editorial process language is not mistaken for an economic causal claim', () => {
  /* This exact sentence is live copy and is TRUE. A rule that rejects it would
     be switched off within a week, so it must not. */
  const v = CG.verifyLanguage('MIXED',
    'We are showing this rather than filing it under agreement, because they did not agree.',
    ['Employment', 'industrial production']);
  assert.equal(v.filter(x => x.rule === 'R7-CAUSAL').length, 0);
});

test('certainty language is refused on a non-definitive state', () => {
  assert.ok(CG.verifyLanguage('MIXED', 'This confirms the labour market is weakening.', ['a', 'b'])
    .some(v => v.rule === 'R8-UNCERTAINTY'));
  assert.equal(CG.verifyLanguage('AGREES', 'The two series moved together.', ['a', 'b']).length, 0);
});

/* ============ THE LIVE PAYLOAD ===================================== */
test('the published payload passes the claim gate', () => {
  const out = execFileSync(process.execPath, ['scripts/claim-gate.js'], {cwd: repo, encoding: 'utf8'});
  assert.match(out, /claim gate: PASS/);
});

test('every graph assertion still holds', () => {
  const res = DG.checkAssertions(graph);
  const rows = Array.isArray(res) ? res : (res.results || []);
  const failed = rows.filter(r => !(r.ok !== undefined ? r.ok : r.pass));
  assert.deepEqual(failed.map(f => f.id), [], 'dependency assertions must all hold');
  assert.ok(rows.length >= 15);
});
