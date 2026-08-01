function finiteSorted(values) {
  return values.filter(Number.isFinite).sort((a, b) => a - b);
}

function quantile(values, probability) {
  const sorted = finiteSorted(values);
  if (!sorted.length) return null;
  if (probability <= 0) return sorted[0];
  if (probability >= 1) return sorted[sorted.length - 1];
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const weight = position - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
}

function percentileRank(sorted, value) {
  if (sorted.length <= 1) return 0;
  const matches = [];
  for (let i = 0; i < sorted.length; i++) if (sorted[i] === value) matches.push(i);
  if (matches.length) {
    const meanIndex = matches.reduce((sum, index) => sum + index, 0) / matches.length;
    return meanIndex / (sorted.length - 1) * 100;
  }
  let insertion = 0;
  while (insertion < sorted.length && sorted[insertion] < value) insertion++;
  return Math.max(0, Math.min(100, insertion / (sorted.length - 1) * 100));
}

function analyzeGauge({history, anchors}) {
  const clean = history
    .filter(row => row && /^\d{4}-\d{2}$/.test(row.month) && Number.isFinite(row.value))
    .sort((a, b) => a.month.localeCompare(b.month));
  if (!clean.length) throw new Error('Gauge history has no valid observations');
  if (!Array.isArray(anchors) || anchors.length < 2) throw new Error('Gauge requires at least two anchors');
  const values = finiteSorted(clean.map(row => row.value));
  const orientation = anchors[anchors.length - 1][1] >= anchors[0][1]
    ? 'higher-is-more-stressful'
    : 'lower-is-more-stressful';
  const round = value => +value.toFixed(2);
  const anchorRows = anchors.map(([raw, stress]) => {
    const stressful = orientation === 'higher-is-more-stressful'
      ? values.filter(value => value >= raw).length
      : values.filter(value => value <= raw).length;
    return {
      raw,
      stress,
      rawPercentile: round(percentileRank(values, raw)),
      stressTailShare: round(stressful / values.length * 100),
    };
  });
  const percentiles = {};
  for (const p of [0, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 1]) {
    percentiles[`p${String(Math.round(p * 100)).padStart(2, '0')}`] = round(quantile(values, p));
  }
  return {
    orientation,
    observations: clean.length,
    coverage: {start: clean[0].month, end: clean[clean.length - 1].month},
    percentiles,
    anchors: anchorRows,
  };
}

function analyzeBacktest(backtest) {
  if (!backtest || !backtest.anchors || !backtest.gaugeHistory) {
    throw new Error('Backtest must include anchors and full gauge history');
  }
  const gauges = {};
  const generatedMonth = typeof backtest.generated === 'string' ? backtest.generated.slice(0, 7) : null;
  for (const [slug, anchors] of Object.entries(backtest.anchors)) {
    const history = backtest.gaugeHistory[slug];
    if (!Array.isArray(history) || !history.length) throw new Error(`Missing full history for anchored gauge: ${slug}`);
    gauges[slug] = analyzeGauge({history, anchors});
    gauges[slug].terminalMonthPartial = Boolean(generatedMonth && gauges[slug].coverage.end === generatedMonth);
  }
  return {
    generated: backtest.generated || null,
    methodology: 'Ward M anchor percentile validation',
    vintageBasis: 'Current-revised reconstruction, not release-time vintages. A terminal month matching the retrieval month is partial.',
    gauges,
  };
}

module.exports = {analyzeBacktest, analyzeGauge, quantile};
