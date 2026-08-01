#!/usr/bin/env node
/* Domain cutover: rewrite every absolute site URL from <old-base> to the value
   in scripts/lib/site-url.js. Markdown (research history) is left untouched.
   Usage: node scripts/set-base-url.js https://arringtonc.github.io/oozemeter */
const {execSync} = require('child_process');
const fs = require('fs');
const NEW = require('./lib/site-url');
const OLD = (process.argv[2] || '').replace(/\/$/, '');
if (!OLD || OLD === NEW) {
  console.error('usage: node scripts/set-base-url.js <old-base>  — old base must differ from scripts/lib/site-url.js');
  process.exit(1);
}
const files = execSync('git ls-files', {encoding: 'utf8'}).split('\n')
  .filter(f => /\.(html|xml|txt|js|json)$/.test(f));
let changed = 0;
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  if (!s.includes(OLD)) continue;
  fs.writeFileSync(f, s.split(OLD).join(NEW));
  changed++;
  console.log('rewrote', f);
}
console.log(JSON.stringify({status: 'pass', from: OLD, to: NEW, files: changed}));
