#!/usr/bin/env node
/* Run every critic. Exit non-zero if any attack got through.

   Critics are deliberately standalone — `node gauntlet/critic_x.js` works on
   its own, so a new one can be written and run without touching this file.
   This just collects them, which is how StockCharter's gauntlet works too. */
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const dir = __dirname;
const critics = fs.readdirSync(dir).filter(f => /^critic_.*\.js$/.test(f)).sort();
const broke = [];

for (const c of critics) {
  try {
    process.stdout.write(execFileSync(process.execPath, [path.join(dir, c)], {encoding: 'utf8'}));
  } catch (e) {
    process.stdout.write(String(e.stdout || ''));
    process.stderr.write(String(e.stderr || ''));
    broke.push(c);
  }
}

console.log(`\n${'='.repeat(60)}`);
if (broke.length) {
  console.error(`GAUNTLET: ${broke.length} of ${critics.length} critic(s) found defects — ${broke.join(', ')}`);
  process.exit(1);
}
console.log(`GAUNTLET: ${critics.length} critics, every attack refused.`);
