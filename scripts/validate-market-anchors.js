#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {analyzeBacktest, renderValidationMarkdown} = require('./lib/market-validation');

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

const backtest = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const report = analyzeBacktest(backtest);
writeAtomic(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
writeAtomic(reportPath, renderValidationMarkdown(report));
console.log(JSON.stringify({status: 'pass', gauges: Object.keys(report.gauges), json: jsonPath, report: reportPath}));
