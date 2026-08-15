/* Traversal over data/dependency-graph.json.
   The one question this file exists to answer: is series X anywhere upstream of
   sensor Y, transitively? D1 shipped because that question was answered by
   reading a variable name. Answer it by walking edges instead. */
const fs = require('fs');
const path = require('path');

const DEFAULT_GRAPH = path.join(__dirname, '..', '..', 'data', 'dependency-graph.json');

function loadGraph(file = DEFAULT_GRAPH) {
  const graph = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (graph.schema !== 'oozemeter.dependency-graph/1') {
    throw new Error(`unsupported dependency-graph schema: ${graph.schema}`);
  }
  const ids = new Set(graph.nodes.map(node => node.id));
  for (const edge of graph.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      throw new Error(`dangling edge ${edge.from} -> ${edge.to}`);
    }
  }
  return graph;
}

/* scoredOnly drops edges marked scored:false — series that reach a reader
   surface but never reach a stress value (AMTMNO is the live example). A
   question about the SCORE must exclude them; a question about a PUBLISHED
   CLAIM must not. */
function adjacency(graph, {scoredOnly = false} = {}) {
  const out = new Map();
  for (const edge of graph.edges) {
    if (scoredOnly && edge.scored === false) continue;
    if (!out.has(edge.from)) out.set(edge.from, []);
    out.get(edge.from).push(edge.to);
  }
  return out;
}

function requireNode(graph, id) {
  if (!graph.nodes.some(node => node.id === id)) throw new Error(`unknown node: ${id}`);
  return id;
}

/* Every path from `from` that reaches `to`, or [] if there is none. Returning
   the path rather than a boolean is deliberate: a gate that says "these two are
   related" without saying HOW gets argued with. */
function pathBetween(graph, from, to, options = {}) {
  requireNode(graph, from);
  requireNode(graph, to);
  const next = adjacency(graph, options);
  const seen = new Set([from]);
  const queue = [[from]];
  while (queue.length) {
    const trail = queue.shift();
    const head = trail[trail.length - 1];
    if (head === to) return trail;
    for (const child of next.get(head) || []) {
      if (seen.has(child)) continue;
      seen.add(child);
      queue.push([...trail, child]);
    }
  }
  return null;
}

function isUpstream(graph, from, to, options = {}) {
  return from !== to && pathBetween(graph, from, to, options) !== null;
}

function descendants(graph, from, options = {}) {
  requireNode(graph, from);
  const next = adjacency(graph, options);
  const seen = new Set();
  const stack = [from];
  while (stack.length) {
    for (const child of next.get(stack.pop()) || []) {
      if (seen.has(child)) continue;
      seen.add(child);
      stack.push(child);
    }
  }
  return seen;
}

/* The independence primitive. Two sensors are independent iff these sets are
   disjoint. Names are never compared. */
function upstreamRawSeries(graph, target, options = {}) {
  requireNode(graph, target);
  const raw = graph.nodes.filter(node => node.kind === 'raw_series').map(node => node.id);
  return new Set(raw.filter(id => isUpstream(graph, id, target, options)));
}

function sharedRawSeries(graph, a, b, options = {}) {
  const left = upstreamRawSeries(graph, a, options);
  return [...upstreamRawSeries(graph, b, options)].filter(id => left.has(id)).sort();
}

function areIndependent(graph, a, b, options = {}) {
  return sharedRawSeries(graph, a, b, options).length === 0;
}

/* Alias collapse is a known attack vector: "credit" names two different sensors
   reading two different series, and "Financial Conditions" / "Credit & Funding"
   name one series in two wings. Resolve names to ids before asking anything. */
function resolveAlias(graph, name) {
  const hits = graph.aliases[name];
  if (!hits) return [];
  return [...hits];
}

function checkAssertions(graph, options = {}) {
  const results = [];
  for (const assertion of graph.assertions) {
    const walk = {...options, ...(assertion.scoredEdgesOnly ? {scoredOnly: true} : {})};
    let actual;
    let detail = null;
    if (assertion.kind === 'upstream') {
      const trail = pathBetween(graph, assertion.from, assertion.to, walk);
      actual = trail !== null;
      if (trail) detail = trail.join(' -> ');
    } else if (assertion.kind === 'upstream-any') {
      actual = assertion.from.some(id => isUpstream(graph, id, assertion.to, walk));
    } else if (assertion.kind === 'disjoint-raw') {
      const shared = sharedRawSeries(graph, assertion.a, assertion.b, walk);
      actual = shared.length === 0;
      if (shared.length) detail = `shares ${shared.join(', ')}`;
    } else if (assertion.kind === 'shared-raw-set') {
      actual = sharedRawSeries(graph, assertion.a, assertion.b, walk);
      detail = actual.join(', ');
    } else {
      throw new Error(`unknown assertion kind: ${assertion.kind}`);
    }
    const pass = JSON.stringify(actual) === JSON.stringify(assertion.expect);
    results.push({id: assertion.id, pass, expected: assertion.expect, actual, detail, why: assertion.why});
  }
  return results;
}

module.exports = {
  DEFAULT_GRAPH,
  areIndependent,
  checkAssertions,
  descendants,
  isUpstream,
  loadGraph,
  pathBetween,
  resolveAlias,
  sharedRawSeries,
  upstreamRawSeries,
};
