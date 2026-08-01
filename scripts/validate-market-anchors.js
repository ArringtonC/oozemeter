#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {analyzeBacktest} = require('./lib/market-validation');

const args = process.argv.slice(2);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const root = path.resolve(__dirname, '..');
const inputPath = path.resolve(value('--input', path.join(root, 'research/market-backtest.json')));
const jsonPath = path.resolve(value('--json', path.join(root, 'research/market-anchor-validation.json')));
const reportPath = path.resolve(value('--report', path.join(root, 'research/market-anchor-validation.md')));

function writeAtomic(target, content) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  const temporary = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, content);
  fs.renameSync(temporary, target);
}

function markdown(report) {
  const lines = [
    '# Ward M anchor validation',
    '',
    `Generated from the backtest acquisition at \`${report.generated}\`.`,
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

const backtest = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const report = analyzeBacktest(backtest);
writeAtomic(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
writeAtomic(reportPath, markdown(report));
console.log(JSON.stringify({status: 'pass', gauges: Object.keys(report.gauges), json: jsonPath, report: reportPath}));
