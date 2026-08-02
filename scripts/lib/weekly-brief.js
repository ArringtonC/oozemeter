/* ============================================================
   Weekly OOZEMeter brief builder.

   Reads validated, already-published artifacts and assembles the
   Monday distribution package. It computes nothing new: every
   number here traces to data/latest.json, data/market.json, or
   data/market-history.json.

   Fail-closed rules:
     - any blocking gate failure  -> status 'failed', no scores
     - stale/incomplete household evidence -> 'failed'
     - malformed or non-integer scores -> 'failed'
     - no previous package -> weekly change is null, never 0
   ============================================================ */
const fs = require('node:fs');
const path = require('node:path');

/* Household band vocabulary is the published one (scripts/story.js).
   Ward M has no published band vocabulary, so we never invent one. */
const HOUSEHOLD_BANDS = [[20, 'Smooth'], [40, 'Sticky'], [60, 'Slippery'], [80, 'Oozing'], [100, 'Overflowing']];

function householdBand(score) {
  const match = HOUSEHOLD_BANDS.find(([max]) => score <= max);
  return match ? match[1] : null;
}

function readJson(root, relative, failures) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) {
    failures.push(`missing required artifact: ${relative}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch (error) {
    failures.push(`unreadable artifact ${relative}: ${error.message}`);
    return null;
  }
}

function integerScore(value) {
  return Number.isInteger(value) ? value : null;
}

function biggestMover(entries) {
  /* entries: [key, {delta}] already filtered to scored lines */
  const finite = entries.filter(([, line]) => Number.isFinite(line.delta));
  if (!finite.length) return null;
  const sorted = [...finite].sort((a, b) => Math.abs(b[1].delta) - Math.abs(a[1].delta) || a[0].localeCompare(b[0]));
  const [key, line] = sorted[0];
  return {key, name: line.name || key, delta: line.delta};
}

function changeWord(delta) {
  if (delta === null) return null;
  if (delta === 0) return 'unchanged';
  return delta < 0 ? `down ${Math.abs(delta)}` : `up ${delta}`;
}

function inspectHousehold(latest, failures) {
  if (!latest) return null;
  const score = integerScore(latest.ooze);
  if (score === null) {
    failures.push('household score is missing or not an integer');
    return null;
  }
  const collection = latest.collection || {};
  if (collection.freshnessStatus !== 'current') {
    failures.push(`household collection freshness is "${collection.freshnessStatus || 'unknown'}", not current`);
  }
  const staleLines = Array.isArray(collection.staleLines) ? collection.staleLines : [];
  if (staleLines.length) failures.push(`household stale source lines: ${staleLines.join(', ')}`);
  const lines = latest.lines && typeof latest.lines === 'object' ? latest.lines : {};
  const scored = Object.entries(lines).filter(([, line]) => line && line.contributesToOoze !== false);
  return {
    score,
    band: householdBand(score),
    month: latest.month || null,
    monthLabel: latest.monthLabel || null,
    methodologyVersion: latest.methodologyVersion || null,
    generated: latest.generated || null,
    freshness: collection.freshnessStatus || null,
    staleLines,
    biggestMover: biggestMover(scored),
    weeklyChange: null,
  };
}

function inspectMarket(market, failures) {
  if (!market) return null;
  const score = integerScore(market.score);
  if (score === null) {
    failures.push('market score is missing or not an integer');
    return null;
  }
  const sensors = market.sensors && typeof market.sensors === 'object' ? market.sensors : {};
  return {
    score,
    band: null, /* Ward M publishes no band vocabulary */
    generated: market.generated || null,
    calibrationStatus: market.calibrationStatus || null,
    biggestMover: biggestMover(Object.entries(sensors)),
    weeklyChange: null,
  };
}

function inspectDivergence(history, failures) {
  if (!history) return null;
  const monthly = Array.isArray(history.monthly) ? history.monthly : [];
  if (!monthly.length) {
    failures.push('market history contains no exact shared months');
    return null;
  }
  const latest = monthly[monthly.length - 1];
  if (!latest || !Number.isInteger(latest.divergence)) {
    failures.push('latest divergence observation is malformed');
    return null;
  }
  return {
    month: latest.month,
    value: latest.divergence,
    market: latest.market,
    household: latest.household,
    observations: monthly.length,
    generated: history.generated || null,
  };
}

function renderDiscordFailure(failures, now) {
  return [
    '**OOZEMeter weekly run failed validation.**',
    'No report was distributed.',
    `Issues: ${failures.join('; ')}`,
    `Checked ${now.toISOString()}.`,
  ].join('\n');
}

function renderDiscord({household, market, divergence, editorial, now}) {
  const householdChange = changeWord(household.weeklyChange);
  const marketChange = changeWord(market.weeklyChange);
  const dateLabel = now.toISOString().slice(0, 10);
  const lines = [
    `**OOZEMeter Weekly Update — ${dateLabel}**`,
    `Household OOZE: ${household.score} (${household.band})`
      + (householdChange ? `, ${householdChange} week over week` : ''),
    `Market OOZE (Ward M): ${market.score}`
      + (marketChange ? `, ${marketChange} week over week` : ''),
  ];
  if (!householdChange && !marketChange) lines.push('This is the first weekly package, so there is no week-over-week comparison yet.');
  if (household.biggestMover) lines.push(`Largest household line move: ${household.biggestMover.name} ${household.biggestMover.delta >= 0 ? '+' : ''}${household.biggestMover.delta} points.`);
  if (market.biggestMover) lines.push(`Largest Ward M sensor move: ${market.biggestMover.name} ${market.biggestMover.delta >= 0 ? '+' : ''}${market.biggestMover.delta} points.`);
  if (divergence) lines.push(`Divergence at ${divergence.month} (exact shared month): ${divergence.value >= 0 ? '+' : ''}${divergence.value}.`);
  if (editorial && editorial.verdict) lines.push(editorial.verdict + '.');
  lines.push('Reports have been generated and emailed.');
  return lines.join('\n');
}

function summarizeGateDetail(detail) {
  /* Gate output may be a JSON report. Reduce it to one readable clause
     rather than dumping the payload into a human-facing brief. */
  if (!detail) return null;
  const text = String(detail).trim();
  try {
    const parsed = JSON.parse(text);
    const failures = Array.isArray(parsed.failures) ? parsed.failures : null;
    if (failures && failures.length) {
      const count = `${failures.length} blocker${failures.length === 1 ? '' : 's'}`;
      const first = String(failures[0]).replace(/[{}"]/g, '').trim();
      return `${count}, first: ${first}`.slice(0, 120);
    }
  } catch {
    /* not JSON — fall through to the plain-text path */
  }
  return text.replace(/[{}"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
}

function renderEmail({household, market, divergence, gates, now, nextRun}) {
  const gateLines = gates.map(gate => {
    const detail = summarizeGateDetail(gate.detail);
    if (gate.ok) return `  ${gate.name}: pass`;
    if (!gate.blocking) return `  ${gate.name}: blocked (expected)${detail ? ` — ${detail}` : ''}`;
    return `  ${gate.name}: FAIL${detail ? ` — ${detail}` : ''}`;
  });
  const householdChange = changeWord(household.weeklyChange);
  const marketChange = changeWord(market.weeklyChange);
  return [
    'OOZEMETER WEEKLY BRIEF',
    '='.repeat(46),
    '',
    'HOUSEHOLD OOZE',
    `  Score:          ${household.score}/100`,
    `  Band:           ${household.band}`,
    `  Reading month:  ${household.monthLabel || household.month}`,
    `  Weekly change:  ${householdChange || 'no prior weekly package'}`,
    `  Main driver:    ${household.biggestMover ? `${household.biggestMover.name} ${household.biggestMover.delta >= 0 ? '+' : ''}${household.biggestMover.delta} points` : 'no line moved'}`,
    `  Methodology:    v${household.methodologyVersion}`,
    `  Collected:      ${household.generated}`,
    '',
    'MARKET OOZE (WARD M)',
    `  Score:          ${market.score}/100`,
    `  Band:           not published for Ward M`,
    `  Weekly change:  ${marketChange || 'no prior weekly package'}`,
    `  Main driver:    ${market.biggestMover ? `${market.biggestMover.name} ${market.biggestMover.delta >= 0 ? '+' : ''}${market.biggestMover.delta} points` : 'no sensor moved'}`,
    `  Calibration:    ${market.calibrationStatus}`,
    `  Collected:      ${market.generated}`,
    '',
    'DIVERGENCE',
    divergence
      ? `  ${divergence.month} (exact shared month): market ${divergence.market}, household ${divergence.household}, divergence ${divergence.value >= 0 ? '+' : ''}${divergence.value} across ${divergence.observations} shared months.`
      : '  not available',
    '  Ward M measures market/financial-system stress. It is not household pressure and does not affect the Ooze Score.',
    '',
    'SYSTEM CHECK',
    ...gateLines,
    `  Household freshness: ${household.freshness}`,
    `  Stale lines:         ${household.staleLines.length ? household.staleLines.join(', ') : 'none'}`,
    `  Package built:       ${now.toISOString()}`,
    `  Next scheduled run:  ${nextRun || 'see cron schedule'}`,
    '',
    'Every figure above is copied from an artifact that passed its integrity gate.',
  ].join('\n');
}

function buildWeeklyBrief({root, now = new Date(), gates = [], previous = null, nextRun = null}) {
  const failures = [];
  const blockingGateFailures = gates.filter(gate => gate.blocking && !gate.ok)
    .map(gate => `${gate.name} failed${gate.detail ? `: ${gate.detail}` : ''}`);
  failures.push(...blockingGateFailures);

  const latest = readJson(root, 'data/latest.json', failures);
  const market = readJson(root, 'data/market.json', failures);
  const history = readJson(root, 'data/market-history.json', failures);
  const editorial = fs.existsSync(path.join(root, 'data/editorial.json'))
    ? readJson(root, 'data/editorial.json', failures)
    : null;

  const householdView = inspectHousehold(latest, failures);
  const marketView = inspectMarket(market, failures);
  const divergence = history ? inspectDivergence(history, failures) : null;

  if (failures.length || !householdView || !marketView) {
    return {
      status: 'failed',
      generated: now.toISOString(),
      failures,
      gates,
      household: null,
      market: null,
      divergence: null,
      discord: renderDiscordFailure(failures, now),
      email: null,
    };
  }

  if (previous && Number.isInteger(previous.household?.score)) {
    householdView.weeklyChange = householdView.score - previous.household.score;
  }
  if (previous && Number.isInteger(previous.market?.score)) {
    marketView.weeklyChange = marketView.score - previous.market.score;
  }

  return {
    status: 'ready',
    generated: now.toISOString(),
    failures: [],
    gates,
    household: householdView,
    market: marketView,
    divergence,
    discord: renderDiscord({household: householdView, market: marketView, divergence, editorial, now}),
    email: renderEmail({household: householdView, market: marketView, divergence, gates, now, nextRun}),
  };
}

module.exports = {buildWeeklyBrief, householdBand};
