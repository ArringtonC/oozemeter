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
    acquisitionFingerprint: backtest.acquisition?.fingerprint || null,
    methodology: 'Ward M anchor percentile validation',
    vintageBasis: 'Current-revised reconstruction, not release-time vintages. A terminal month matching the retrieval month is partial.',
    gauges,
  };
}

function renderValidationMarkdown(report) {
  const lines = [
    '# Ward M anchor validation',
    '',
    `Generated from the backtest acquisition at \`${report.generated}\`.`,
    `Acquisition receipt: \`${report.acquisitionFingerprint}\`.`,
    '',
    'This report checks every provisional raw-value anchor against available current-revised history, not release-time vintages. A terminal month matching the retrieval month is partial. `Raw percentile` is the anchor’s position in the observed distribution. `At least this stressful` is the share of historical observations on the stressful side of that anchor. These are descriptive checks, not a license to tune anchors until the backtest tells a preferred story.',
    '',
    '## Coverage and distribution',
    '',
    '| Gauge | Direction | Coverage | Terminal | N | p05 | p50 | p95 |',
    '|---|---|---:|---|---:|---:|---:|---:|',
  ];
  for (const [slug, gauge] of Object.entries(report.gauges)) {
    lines.push(`| ${slug} | ${gauge.orientation} | ${gauge.coverage.start}–${gauge.coverage.end} | ${gauge.terminalMonthPartial ? 'partial retrieval month' : 'prior month'} | ${gauge.observations} | ${gauge.percentiles.p05} | ${gauge.percentiles.p50} | ${gauge.percentiles.p95} |`);
  }
  for (const [slug, gauge] of Object.entries(report.gauges)) {
    lines.push('', `## ${slug}`, '', '| Raw anchor | Stress | Raw percentile | At least this stressful |', '|---:|---:|---:|---:|');
    for (const anchor of gauge.anchors) {
      lines.push(`| ${anchor.raw} | ${anchor.stress} | ${anchor.rawPercentile}% | ${anchor.stressTailShare}% |`);
    }
  }
  lines.push('', '## Interpretation rule', '', '- Anchors outside the observed range are explicit extrapolation points.', '- Closely clustered percentile ranks mean several score bands are competing for little historical variation.', '- A high stress score attached to a common tail share should be justified by construct meaning, not crisis matching alone.', '- Any anchor change requires a new Ward M methodology version, a before/after history comparison, and public explanation.', '');
  return lines.join('\n');
}

module.exports = {analyzeBacktest, analyzeGauge, quantile, renderValidationMarkdown};
