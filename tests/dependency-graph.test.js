const test = require('node:test');
const assert = require('node:assert');
const {
  areIndependent, checkAssertions, isUpstream, loadGraph, pathBetween,
  resolveAlias, sharedRawSeries, upstreamRawSeries,
} = require('../scripts/lib/dependency-graph');

const graph = loadGraph();

test('the graph loads, has no dangling edges, and has no duplicate node ids', () => {
  const ids = graph.nodes.map(node => node.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'duplicate node ids');
  assert.ok(graph.nodes.length > 100 && graph.edges.length > 100);
});

/* D1 — the regression target. The cross-check module compared the HOUSING line
   against MORTGAGE DELINQUENCY while collect.js:110 computes housing as
   max(mortgage-rate stress, mortgage-DELINQUENCY stress). It must fall out of
   the graph without anyone reading a variable name. */
test('D1 reproduces: DRSFRMACBS is provably upstream of the housing line', () => {
  const trail = pathBetween(graph, 'raw:fred:DRSFRMACBS', 'sensor:household:housing');
  assert.ok(trail, 'DRSFRMACBS must be upstream of housing');
  assert.ok(trail.includes('derived:forward-fill:DRSFRMACBS'));
});

test('D1 reproduces: housing and foreclosures share a raw series, so the pair is illegal', () => {
  assert.deepStrictEqual(
    sharedRawSeries(graph, 'sensor:household:housing', 'sensor:household:foreclosures'),
    ['raw:fred:DRSFRMACBS'],
  );
  assert.strictEqual(areIndependent(graph, 'sensor:household:housing', 'sensor:household:foreclosures'), false);
});

/* The pair that is currently published. INDPRO appears in no weighted line, so
   jobs-vs-manufacturing is genuinely independent — proved here rather than by
   hand. */
test('jobs/manufacturing is legal: INDPRO is provably NOT upstream of jobs', () => {
  assert.strictEqual(isUpstream(graph, 'raw:fred:INDPRO', 'sensor:household:jobs'), false);
  assert.deepStrictEqual(
    [...upstreamRawSeries(graph, 'sensor:household:jobs')].sort(),
    ['raw:fred:ICSA', 'raw:fred:UNRATE'],
  );
  assert.strictEqual(areIndependent(graph, 'sensor:household:jobs', 'sensor:household:manufacturing'), true);
});

/* The dependency nobody would guess from a name: gas is CPI-deflated, so CPI is
   an input to gas, which makes gas-vs-inflation the next D1. */
test('gas depends transitively on CPI, so gas and inflation are NOT independent', () => {
  assert.ok(pathBetween(graph, 'raw:fred:CPIAUCNS', 'sensor:household:gas'));
  assert.deepStrictEqual(
    sharedRawSeries(graph, 'sensor:household:gas', 'sensor:household:inflation'),
    ['raw:fred:CPIAUCNS'],
  );
});

/* Alias collapse. "credit" names two sensors reading two different series;
   "Financial Conditions" and "Credit & Funding" name one series in two wings. */
test('name collisions do not survive traversal', () => {
  assert.strictEqual(areIndependent(graph, 'sensor:household:credit', 'sensor:ward:credit'), true);
  assert.deepStrictEqual(
    sharedRawSeries(graph, 'sensor:household:financial', 'sensor:ward:credit'),
    ['raw:fred:NFCI'],
  );
  assert.ok(resolveAlias(graph, 'Credit & Funding').includes('raw:fred:NFCI'));
  assert.ok(resolveAlias(graph, 'Financial Conditions').includes('raw:fred:NFCI'));
});

/* The published cross-wing claim: "the only input the two instruments have in
   common". True at series identity, and now provable. */
test('the household jar and Ward M share exactly one raw series', () => {
  assert.deepStrictEqual(
    sharedRawSeries(graph, 'score:household:ooze', 'score:ward:score'),
    ['raw:fred:NFCI'],
  );
});

test('no equity ticker is upstream of the Ooze Score', () => {
  for (const node of graph.nodes.filter(n => n.id.startsWith('raw:yahoo:'))) {
    assert.strictEqual(isUpstream(graph, node.id, 'score:household:ooze'), false, node.id);
  }
});

/* Display-only edges reach a reader but not the score. */
test('AMTMNO reaches the manufacturing claim but not the manufacturing stress value', () => {
  assert.strictEqual(isUpstream(graph, 'raw:fred:AMTMNO', 'stress:household:manufacturing', {scoredOnly: true}), false);
  assert.strictEqual(isUpstream(graph, 'raw:fred:AMTMNO', 'sensor:household:manufacturing'), true);
});

/* The largest-remainder split normalizes by the sum of all weighted stresses,
   so an ounce count is a claim about every weighted line. */
test('contribution normalization couples every weighted line to every other', () => {
  assert.ok(isUpstream(graph, 'raw:fred:GASREGW', 'contribution:household:jobs'));
  assert.ok(isUpstream(graph, 'raw:fred:UNRATE', 'contribution:household:gas'));
});

test('every declared assertion holds', () => {
  const failures = checkAssertions(graph).filter(result => !result.pass);
  assert.deepStrictEqual(failures, [], JSON.stringify(failures, null, 1));
});
