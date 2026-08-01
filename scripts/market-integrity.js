#!/usr/bin/env node
const path = require('path');
const {inspectMarketRelease} = require('./lib/market-integrity');

const rootIndex = process.argv.indexOf('--root');
const root = rootIndex >= 0 ? path.resolve(process.argv[rootIndex + 1]) : path.resolve(__dirname, '..');
const result = inspectMarketRelease(root);
console.log(JSON.stringify(result));
if (result.failures.length) process.exitCode = 1;
