#!/usr/bin/env node
/* Critic: independence by traversal, not by naming.

   D1 shipped because a diagnostic was believed independent on the strength of
   having a different NAME. This critic attacks the graph the same way: does it
   still catch a shared series when the sharing is transitive, when the two ends
   are spelled differently, and does it stay honest in the other direction —
   refusing to call a genuinely independent pair dependent? A gate that says
   "not independent" about everything is useless, so both errors are attacks. */
const {attack, report} = require('./harness');
const CG = require('../scripts/lib/claim-gate');
const DG = require('../scripts/lib/dependency-graph');
const g = DG.loadGraph();
const ind = (a, b) => CG.verifyIndependence(g, a, b).verified;

/* --- the known circularity must stay caught --- */
attack('D1: housing vs its own delinquency input', {
  input: ['housing', 'foreclosures'], expected: false, actual: ind('housing', 'foreclosures'),
  falseClaim: '"The jar reads the mortgage rate. It does not read mortgage delinquency."',
  rootCause: 'shallow name comparison instead of upstream traversal'});

/* --- transitive: CPI reaches gas through the deflator, never named in prose --- */
attack('transitive: gas vs inflation share CPI via the deflator', {
  input: ['gas', 'inflation'], expected: false, actual: ind('gas', 'inflation'),
  falseClaim: '"gas and inflation are independent measures" — CPI is upstream of both',
  rootCause: 'a one-hop dependency check misses a deflator applied inside the transform'});

/* --- the live pair must stay legal, or the gate is just a blanket refusal --- */
attack('the published pair is still provably independent', {
  input: ['jobs', 'manufacturing'], expected: true, actual: ind('jobs', 'manufacturing'),
  falseClaim: 'no false claim — but a gate that refuses everything gets switched off',
  rootCause: 'over-broad traversal, e.g. walking through the composite node'});

/* --- symmetry: independence is a property of the pair, not the argument order --- */
for (const [a, b] of [['housing', 'foreclosures'], ['jobs', 'manufacturing'], ['gas', 'inflation']]) {
  attack(`symmetric: ${a} vs ${b} == ${b} vs ${a}`, {
    input: [a, b], expected: ind(a, b), actual: ind(b, a),
    falseClaim: 'a pair declared independent in one direction and dependent in the other',
    rootCause: 'traversal that walks only one side of the edge list'});
}

/* --- every weighted line against itself is the most trivial circularity --- */
for (const line of ['housing', 'jobs', 'gas', 'credit', 'auto', 'inflation', 'financial']) {
  attack(`self-comparison: ${line} vs ${line} is never independent`, {
    input: [line, line], expected: false, actual: ind(line, line),
    falseClaim: `"${line} is corroborated by ${line}"`,
    rootCause: 'a node is not in its own upstream set unless the walk seeds with itself'});
}

/* --- the aliases table must actually collapse duplicate spellings --- */
const aliasKeys = Object.keys(g.aliases || {});
attack('the graph carries alias mappings at all', {
  input: 'graph.aliases', expected: true, actual: aliasKeys.length > 0,
  falseClaim: 'the same FRED series under two names read as two independent series',
  rootCause: 'no alias table means spelling defeats the traversal'});

report('critic_alias');
