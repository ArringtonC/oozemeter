#!/usr/bin/env node
const path = require('path');
const {inspectCurrentMarketEvidence, inspectMarketRelease} = require('./lib/market-integrity');

const rootIndex = process.argv.indexOf('--root');
const root = rootIndex >= 0 ? path.resolve(process.argv[rootIndex + 1]) : path.resolve(__dirname, '..');
const release = inspectMarketRelease(root);
const evidence = process.argv.includes('--require-current-evidence')
  ? inspectCurrentMarketEvidence(root)
  : {failures:[]};
const result = {
  status: release.failures.length || evidence.failures.length ? 'fail' : 'pass',
  failures:[...release.failures, ...evidence.failures],
};
console.log(JSON.stringify(result));
if (result.failures.length) process.exitCode = 1;
