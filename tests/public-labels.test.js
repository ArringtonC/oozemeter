const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const lab = fs.readFileSync(path.join(repo, 'lab.js'), 'utf8');
const archive = fs.readFileSync(path.join(repo, 'archive.html'), 'utf8');
const index = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const latest = JSON.parse(fs.readFileSync(path.join(repo, 'data/latest.json'), 'utf8'));

test('public labels disclose auxiliary proxies and public manufacturing inputs', () => {
  assert.doesNotMatch(lab, /Demo build: all figures illustrative/);
  assert.match(lab, /name:'Mortgage Distress'/);
  assert.match(lab, /seriesId:'DRSFRMACBS'/);
  assert.match(lab, /name:'Federal Reserve Industrial Production'/);
  assert.match(lab, /seriesId:'INDPRO'/);
  assert.doesNotMatch(lab, /source:\{name:'ISM Manufacturing PMI'/);
});

test('live indicator source labels come from collector provenance', () => {
  assert.match(lab, /x\.source=\{name:`\$\{l\.source\.publisher\} — \$\{l\.source\.metric\}`/);
  assert.match(lab, /HISTORY\.splice\(0,HISTORY\.length,\.\.\.LD\.history\)/);
});

test('methodology-v2 archive does not fabricate pre-2003 scores', () => {
  assert.doesNotMatch(lab, /Daily live collection pending/);
  assert.doesNotMatch(lab, /\{year:2001,/);
  assert.match(archive, /23 years of measured U\.S\. economic stress/i);
  assert.match(archive, /ex-post reconstruction.*latest revised observations.*not a release-time vintage/i);
  assert.match(archive, /id="timeSlider" min="2003"/);
  assert.match(archive, /id="timeSlider"[^>]*step="any"/);
  assert.doesNotMatch(archive, /Dot-com|9\/11|const x0=2000/);
  assert.match(archive, /slider\.max=HISTORY\[HISTORY\.length-1\]\[0\]/);
});

test('archive renders missing months as gaps instead of interpolated scores', () => {
  assert.match(lab, /if\(y2-y1>0\.12\)return null/);
  assert.doesNotMatch(archive, /reading shown is interpolated across a gap/i);
  assert.match(archive, /No canonical observation for this month/i);
});

test('zero-weight auxiliary sensors are labeled instead of shown as zero pressure', () => {
  assert.match(lab, /x\.contributesToOoze=l\.contributesToOoze!==false/);
  assert.match(index, /const amount=x\.contributesToOoze\?.*:'AUX'/);
  assert.match(index, /PROVISIONAL AUXILIARY SENSOR.*0-WEIGHT.*DOES NOT ALTER THE OOZE SCORE/);
  assert.match(archive, /y\.contributesToOoze\?`\+\$\{y\.contrib\}`:'AUX'/);
  assert.match(lab, /INDICATORS\.reduce\(\(a,x\)=>a\+x\.contrib,0\)===TODAY_SCORE/);
});

test('Financial Conditions is a weighted v3 line rather than an auxiliary sensor', () => {
  assert.equal(latest.methodologyVersion, '3.0.0');
  const weighted = Object.entries(latest.lines).filter(([, line]) => line.contributesToOoze !== false).map(([slug]) => slug);
  const auxiliary = Object.entries(latest.lines).filter(([, line]) => line.contributesToOoze === false).map(([slug]) => slug);
  assert.equal(latest.lines.financial.contributesToOoze, true);
  assert.ok(weighted.includes('financial'));
  assert.ok(!auxiliary.includes('financial'));
});

test('public chrome distinguishes current, degraded, stale, and offline feeds', () => {
  assert.match(lab, /function feedState\(data,now=Date\.now\(\)\)/);
  assert.match(lab, /now-generated>2\*864e5/);
  assert.match(lab, /freshnessStatus==='degraded'/);
  assert.match(lab, /class="live \$\{FEED_STATE\}"/);
  assert.match(lab, /\$\{FEED_LABEL\}/);
  assert.match(index, /COLLECTION PIPELINE STALE/);
  assert.match(index, /STALE INTAKE LINE/);
});
