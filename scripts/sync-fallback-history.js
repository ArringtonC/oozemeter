#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootFlag = process.argv.indexOf('--root');
const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : path.resolve(__dirname, '..'));
if (rootFlag >= 0 && !process.argv[rootFlag + 1]) {
  throw new Error('--root requires a directory');
}

const historyPath = path.join(root, 'data/history.json');
const labPath = path.join(root, 'lab.js');
const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
if (!Array.isArray(history) || !history.length || history.some(row => !Array.isArray(row) || row.length !== 2)) {
  throw new Error('data/history.json must contain non-empty [month, score] rows');
}

const lab = fs.readFileSync(labPath, 'utf8');
const declaration = /const HISTORY\s*=\s*\[[\s\S]*?\];/;
if (!declaration.test(lab)) {
  throw new Error('lab.js HISTORY declaration was not found');
}

const synced = lab.replace(declaration, `const HISTORY = ${JSON.stringify(history)};`);
fs.writeFileSync(labPath, synced);
console.log(`synced lab.js fallback history: ${history.length} months`);
