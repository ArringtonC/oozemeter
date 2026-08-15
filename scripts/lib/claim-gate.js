/* ============================================================
   THE CLAIM GATE — truth state before prose.

   Three adversarial reviews in a row found publishable falsehoods AFTER CI went
   green. Both of the most recent were the same shape: a conclusion decided
   inside presentation code, with nothing upstream that could disagree.

     D1  the housing cross-check compared housing against mortgage delinquency,
         which scripts/collect.js computes housing FROM. The module would have
         published "the jar does not read mortgage delinquency" beside a public
         file where it plainly does.
     D2  row logic was `fired ? 'disagrees' : 'agrees'`, so two series moving in
         OPPOSITE directions under the magnitude threshold printed "agrees" —
         in the visible text and, worse, in the screen-reader string.

   Neither was catchable by any existing gate, because prose was where truth got
   decided. This module moves that decision upstream: a claim's STATE is
   computed and validated here, and prose may only choose HOW TO SAY IT.

   The governing rule: OOZEMeter may say less, but it may not confidently say
   more than the evidence supports.
   ============================================================ */
const DG = require('./dependency-graph');

/* Every state a relationship may hold. There is deliberately no default and no
   catch-all: a relationship that reaches the end of evaluation without matching
   a rule is INVALID, not agreeing. */
const STATES = Object.freeze(['AGREES', 'MIXED', 'CONFLICT', 'INSUFFICIENT', 'STALE', 'UNCHECKED', 'INVALID']);

/* Language that asserts causation, and language that only asserts co-movement.
   The first tier requires evidence this instrument does not have for a
   month-over-month directional comparison, so it is refused outright on any
   claim whose state is not SUPPORTED-with-mechanism. */
const CAUSAL_TERMS = ['because', 'caused', 'causes', 'explains', 'led to', 'drove', 'due to', 'resulted in', 'triggered'];
const CERTAINTY_TERMS = ['proves', 'confirms', 'demonstrates', 'shows that', 'means that', 'clearly', 'certainly', 'undoubtedly'];

/* Phrases that assert a NEGATIVE dependency. Each one is a promise about the
   graph, and D1 was exactly a broken promise of this kind, so any claim
   carrying one must name the series it is denying and prove the denial. */
const NEGATIVE_PATTERNS = [
  /does not (?:read|use|include)/i,
  /is not (?:part of|included in|used by)/i,
  /carr(?:ies|y) no score weight/i,
  /\bindependent\b/i,
  /\bunweighted\b/i,
  /no bearing on/i,
];

const SENSOR_NODE = slug => `sensor:household:${slug}`;

function violation(rule, message, detail) {
  return {rule, message, detail: detail || null};
}

/* ---- RULE 1 + 2: independence, proven by traversal, never by naming ------- */
function verifyIndependence(graph, primarySlug, diagnosticSlug) {
  const a = SENSOR_NODE(primarySlug);
  const b = SENSOR_NODE(diagnosticSlug);
  const shared = DG.sharedRawSeries(graph, a, b);
  return {
    verified: shared.length === 0,
    sharedSeries: shared,
    /* the path is the evidence a reader could check for themselves */
    proof: shared.length
      ? (DG.pathBetween(graph, shared[0], a) || []).join(' -> ')
      : `no raw series reachable from both ${a} and ${b}`,
  };
}

/* ---- RULE 3: state exhaustiveness ---------------------------------------
   Every directional case is enumerated. Nothing falls through to AGREES.
   `expected` is the economic prior: 'same' means the two series should normally
   move together (opposite movement is the contradiction), 'inverse' means they
   should normally move oppositely (together is the contradiction). Getting this
   backwards is its own falsehood class, so it is explicit per pair. */
function classifyRelationship({primaryDelta, diagnosticDelta, threshold, expected = 'same', primaryStale = false, diagnosticStale = false}) {
  if (!Number.isFinite(primaryDelta) || !Number.isFinite(diagnosticDelta)) return 'INSUFFICIENT';
  /* RULE 6: a stale diagnostic may never strengthen a current interpretation. */
  if (primaryStale || diagnosticStale) return 'STALE';

  const bothFlat = primaryDelta === 0 && diagnosticDelta === 0;
  if (bothFlat) return 'AGREES';
  /* One flat and one moving is not agreement and not conflict: there is no
     direction to compare against. */
  if (primaryDelta === 0 || diagnosticDelta === 0) return 'INSUFFICIENT';

  const sameDirection = (primaryDelta > 0) === (diagnosticDelta > 0);
  const contradicts = expected === 'same' ? !sameDirection : sameDirection;
  const bothMaterial = Math.abs(primaryDelta) >= threshold && Math.abs(diagnosticDelta) >= threshold;

  if (!contradicts) return 'AGREES';
  /* Contradicting, but at least one move is inside the noise band. This is the
     D2 case: it is NOT agreement, and it is not yet a reportable conflict. */
  return bothMaterial ? 'CONFLICT' : 'MIXED';
}

/* ---- RULE 4: one conclusion, many wordings -------------------------------
   Surfaces may simplify. They may not disagree. Equivalence is asserted on the
   canonical state each surface claims to be expressing, never on the wording. */
function verifyNarrativeEquivalence(surfaces) {
  const states = Object.entries(surfaces).map(([name, s]) => [name, s && s.state]);
  const distinct = [...new Set(states.map(([, s]) => s))];
  return {
    equivalent: distinct.length === 1,
    states: Object.fromEntries(states),
    detail: distinct.length === 1 ? null : `surfaces disagree: ${states.map(([n, s]) => `${n}=${s}`).join(', ')}`,
  };
}

/* ---- RULES 7 + 8: language may not outrun the state ----------------------
   The causal rule is deliberately NARROW. A first draft flagged every "because"
   in the payload and its first catch was a true sentence — "we are showing this
   rather than filing it under agreement, because they did not agree" — which is
   a statement about our own editorial process, not about the economy. A rule
   that fires on true sentences gets switched off, so this one only fires where
   the danger actually lives: a causal verb linking the two SUBJECTS of the
   comparison inside one sentence ("employment fell BECAUSE manufacturing rose").
   Prefixing a sentence with "We" does not exempt it — the test is whether both
   economic subjects appear, not who the grammatical subject is. */
const sentences = t => String(t || '').split(/(?<=[.!?])\s+/).filter(Boolean);

function verifyLanguage(state, text, subjects = []) {
  const out = [];
  const terms = list => list.map(w => new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i'));
  const causalRe = terms(CAUSAL_TERMS);
  const certainRe = terms(CERTAINTY_TERMS);
  const named = s => subjects.filter(sub => sub && new RegExp(sub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(s));

  for (const s of sentences(text)) {
    const causal = causalRe.filter(r => r.test(s));
    /* two economic subjects + a causal verb in one sentence = a causal claim
       this instrument cannot support. One subject, or none, is prose. */
    if (causal.length && named(s).length >= 2) {
      out.push(violation('R7-CAUSAL',
        `causal language linking ${named(s).join(' and ')}: "${s.trim().slice(0, 120)}"`,
        'This instrument compares month-over-month direction and cannot establish cause. Use "coincided with" / "was accompanied by" / "is consistent with".'));
    }
    if (state !== 'AGREES' && state !== 'CONFLICT') {
      const certain = certainRe.filter(r => r.test(s));
      if (certain.length) out.push(violation('R8-UNCERTAINTY',
        `certainty language on a ${state} state: "${s.trim().slice(0, 120)}"`,
        'MIXED, INSUFFICIENT, STALE and UNCHECKED states may not speak with certainty.'));
    }
  }
  return out;
}

/* ---- RULE 2 enforcement: a negative claim must name and prove its denial -- */
function verifyNegativeClaims(graph, claim) {
  const out = [];
  const texts = [claim.userLanguage, claim.accessibilityLanguage, ...(claim.body || [])].filter(Boolean);
  const asserts = texts.some(t => NEGATIVE_PATTERNS.some(p => p.test(String(t))));
  if (!asserts) return out;

  if (!claim.independenceRequired) {
    out.push(violation('R2-NEGATIVE-UNDECLARED',
      'claim asserts a negative dependency but does not set independenceRequired',
      'Absence must be demonstrated, not assumed. Declare it so the graph can be consulted.'));
    return out;
  }
  if (!claim.independenceVerified) {
    out.push(violation('R2-NEGATIVE-UNPROVEN',
      'claim asserts a negative dependency that the graph does not support',
      claim.independenceProof || 'no proof recorded'));
  }
  return out;
}

/* ---- RULE 5: vintage compatibility --------------------------------------- */
function verifyVintage(claim) {
  const out = [];
  const {primaryPeriod, diagnosticPeriod, vintageMismatchAllowed, vintageDisclosure} = claim;
  if (!primaryPeriod || !diagnosticPeriod) return out;
  if (primaryPeriod === diagnosticPeriod) return out;
  if (vintageMismatchAllowed && vintageDisclosure) return out;
  out.push(violation('R5-VINTAGE',
    `compares ${primaryPeriod} against ${diagnosticPeriod}`,
    'Mismatched observation periods must be explicitly allowed AND disclosed to the reader.'));
  return out;
}

/* ---- RULE 9: the UI and the claim must agree about score weight ---------- */
function verifyZeroWeight(claim, weights) {
  const out = [];
  if (!claim.diagnosticSlug) return out;
  const w = weights ? weights[claim.diagnosticSlug] : undefined;
  if (w === undefined) return out;
  const claimsZero = claim.diagnosticContributesToOoze === false;
  if (claimsZero && w > 0) out.push(violation('R9-ZERO-WEIGHT',
    `claim says ${claim.diagnosticSlug} carries no score weight, but the published weight is ${w}`));
  if (!claimsZero && w === 0) out.push(violation('R9-ZERO-WEIGHT',
    `claim does not disclose that ${claim.diagnosticSlug} is zero-weight`));
  return out;
}

/* ---- the gate ------------------------------------------------------------ */
function validateClaim(claim, {graph = DG.loadGraph(), weights = null} = {}) {
  const violations = [];

  if (!STATES.includes(claim.state)) {
    violations.push(violation('R3-STATE', `unknown state "${claim.state}"`, `allowed: ${STATES.join(', ')}`));
  }

  /* RULE 1 — independence is proven, or the claim is INVALID. Not downgraded to
     a softer wording: a cross-check that isn't independent isn't a cross-check. */
  if (claim.independenceRequired && claim.primarySlug && claim.diagnosticSlug) {
    const ind = verifyIndependence(graph, claim.primarySlug, claim.diagnosticSlug);
    claim.independenceVerified = ind.verified;
    claim.independenceProof = ind.proof;
    if (!ind.verified) {
      violations.push(violation('R1-INDEPENDENCE',
        `${claim.diagnosticSlug} is not independent of ${claim.primarySlug} — shares ${ind.sharedSeries.join(', ')}`,
        ind.proof));
    }
  }

  violations.push(...verifyNegativeClaims(graph, claim));
  violations.push(...verifyVintage(claim));
  violations.push(...verifyZeroWeight(claim, weights));

  const subjects = claim.subjects || [claim.primaryName, claim.diagnosticName].filter(Boolean);
  for (const [surface, text] of Object.entries(claim.surfaces || {})) {
    violations.push(...verifyLanguage(claim.state, text, subjects).map(v => ({...v, surface})));
  }

  if (claim.surfaceStates) {
    const eq = verifyNarrativeEquivalence(claim.surfaceStates);
    if (!eq.equivalent) violations.push(violation('R4-SAME-STATE', eq.detail, JSON.stringify(eq.states)));
  }

  const blocking = violations.filter(v => v.rule !== 'R9-ZERO-WEIGHT' || true);
  return {
    claimId: claim.claimId || null,
    state: violations.some(v => v.rule === 'R1-INDEPENDENCE') ? 'INVALID' : claim.state,
    validationStatus: blocking.length ? 'REJECTED' : 'VALID',
    violations,
  };
}

module.exports = {
  STATES, CAUSAL_TERMS, CERTAINTY_TERMS, NEGATIVE_PATTERNS,
  classifyRelationship, verifyIndependence, verifyNarrativeEquivalence,
  verifyLanguage, verifyNegativeClaims, verifyVintage, verifyZeroWeight,
  validateClaim,
};
