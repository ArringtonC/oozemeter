const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const lineHistory = JSON.parse(fs.readFileSync(path.join(repo, 'data/line-history.json'), 'utf8'));
const backtest = JSON.parse(fs.readFileSync(path.join(repo, 'research/backtest-results.json'), 'utf8'));
const workflow = fs.readFileSync(path.join(repo, '.github/workflows/collect.yml'), 'utf8');
const latest = JSON.parse(fs.readFileSync(path.join(repo, 'data/latest.json'), 'utf8'));

test('line history publishes every month the backtest computes', () => {
  assert.equal(lineHistory.methodologyVersion, backtest.methodologyVersion);
  assert.equal(lineHistory.months.length, backtest.monthly.length);
  assert.equal(lineHistory.months[0].month, backtest.monthly[0].month);
  assert.equal(
    lineHistory.months[lineHistory.months.length - 1].month,
    backtest.monthly[backtest.monthly.length - 1].month
  );
});

test('line history scores agree with the jar for the same month', () => {
  const history = new Map(JSON.parse(fs.readFileSync(path.join(repo, 'data/history.json'), 'utf8')));
  const key = (ym) => { const [y, m] = ym.split('-').map(Number); return +(y + (m - 1) / 12).toFixed(3); };
  for (const row of lineHistory.months) {
    const jar = history.get(key(row.month));
    if (jar != null) assert.equal(row.ooze, jar, `ooze mismatch at ${row.month}`);
  }
});

test('line history carries every weighted line with in-range stresses', () => {
  const weighted = Object.entries(latest.lines)
    .filter(([, line]) => line.contributesToOoze !== false)
    .map(([slug]) => slug);
  const rows = lineHistory.months;
  assert.ok(rows.length > 200, `expected multi-decade history, got ${rows.length} months`);
  for (const slug of weighted) {
    assert.ok(rows.every((r) => Number.isFinite(r.stresses[slug])), `line ${slug} incomplete`);
  }
  for (const r of rows) for (const v of Object.values(r.stresses)) {
    assert.ok(v >= 0 && v <= 100, `stress out of range at ${r.month}: ${v}`);
  }
});

test('daily workflow regenerates line history after the backtest', () => {
  assert.match(workflow, /node scripts\/backtest\.js[\s\S]*node scripts\/build-line-history\.js/);
  assert.ok(workflow.indexOf('node scripts/build-line-history.js') < workflow.indexOf('node scripts/backfill-reports.js'));
  assert.match(workflow, /tests\/line-history\.test\.js/);
});
