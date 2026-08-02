#!/usr/bin/env node
/* ============================================================
   OOZEMeter weekly delivery — the Monday stage.

   Reads the package the Sunday stage built and decides what to
   send. It never computes a score, never regenerates a report,
   and never invents a number: it only reads or refuses.

   Refusal cases (each announced, never silent):
     missing            no package was built at all
     stale              the package is older than --max-age-hours
     failed             Sunday validation failed; alert, no email
     already-delivered  guard against double-sending

   Output is one JSON object on stdout:
     {status, deliver, discord, email:{subject,body}|null, ...}
   Exit code is nonzero for anything other than a healthy send,
   so a scheduler can alert without parsing prose.
   ============================================================ */
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');

function flag(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : true;
}

function emit(payload, ok) {
  console.log(JSON.stringify(payload, null, 1));
  if (!ok) process.exitCode = 1;
}

function main() {
  const outRoot = path.resolve(flag('--out', path.join(REPO, '.weekly')));
  const maxAgeHours = Number(flag('--max-age-hours', '48'));
  const markDelivered = process.argv.includes('--mark-delivered');
  const resend = process.argv.includes('--resend');

  const pointer = path.join(outRoot, 'latest.json');
  if (!fs.existsSync(pointer)) {
    return emit({
      status: 'missing',
      deliver: true,
      discord: '**OOZEMeter weekly delivery could not run.**\nThere is no weekly package to send. The Sunday build stage did not produce one.\nNo report was distributed.',
      email: null,
    }, false);
  }

  let latest;
  try {
    latest = JSON.parse(fs.readFileSync(pointer, 'utf8'));
  } catch (error) {
    return emit({
      status: 'missing',
      deliver: true,
      discord: `**OOZEMeter weekly delivery could not run.**\nThe package pointer is unreadable: ${error.message}\nNo report was distributed.`,
      email: null,
    }, false);
  }

  const packageDir = latest.packageDir && fs.existsSync(latest.packageDir)
    ? latest.packageDir
    : path.join(outRoot, latest.date || '');
  const manifestPath = path.join(packageDir, 'package.json');
  if (!fs.existsSync(manifestPath)) {
    return emit({
      status: 'missing',
      deliver: true,
      discord: '**OOZEMeter weekly delivery could not run.**\nThere is no weekly package manifest at the recorded location.\nNo report was distributed.',
      email: null,
    }, false);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const deliveredMarker = path.join(packageDir, 'DELIVERED');

  if (fs.existsSync(deliveredMarker) && !resend) {
    return emit({
      status: 'already-delivered',
      deliver: false,
      date: manifest.date,
      discord: null,
      email: null,
      note: `Package ${manifest.date} was already delivered. Pass --resend to send it again.`,
    }, true);
  }

  const ageHours = (Date.now() - Date.parse(manifest.generated)) / 3600000;
  if (Number.isFinite(maxAgeHours) && ageHours > maxAgeHours) {
    return emit({
      status: 'stale',
      deliver: true,
      date: manifest.date,
      ageHours: Number(ageHours.toFixed(1)),
      discord: [
        '**OOZEMeter weekly delivery refused: the package is stale.**',
        `The newest package (${manifest.date}) is ${ageHours.toFixed(1)} hours old, past the ${maxAgeHours}-hour limit.`,
        'No report was distributed. Last week\'s numbers were not re-sent as if they were current.',
      ].join('\n'),
      email: null,
    }, false);
  }

  if (manifest.status !== 'ready') {
    return emit({
      status: 'failed',
      deliver: true,
      date: manifest.date,
      failures: manifest.failures || [],
      discord: manifest.discord,
      email: null,
    }, false);
  }

  if (markDelivered) fs.writeFileSync(deliveredMarker, `${new Date().toISOString()}\n`);

  return emit({
    status: 'ready',
    deliver: true,
    date: manifest.date,
    household: manifest.household ? manifest.household.score : null,
    market: manifest.market ? manifest.market.score : null,
    discord: manifest.discord,
    email: {
      subject: `OOZEMeter Weekly Reports — ${manifest.date}`,
      body: manifest.email,
    },
  }, true);
}

main();
