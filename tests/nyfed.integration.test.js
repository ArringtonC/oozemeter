const test = require('node:test');
const assert = require('node:assert/strict');

const {fetchNyFedAutoSeries} = require('../scripts/lib/methodology');

test('downloads and extracts the current NY Fed auto 30-plus transition series', {timeout: 30000}, async () => {
  assert.equal(typeof fetchNyFedAutoSeries, 'function');
  const result = await fetchNyFedAutoSeries();
  assert.match(result.sourceUrl, /HHD_C_Report_\d{4}Q[1-4](?:\.xlsx)?$/);
  assert.ok(Object.keys(result.monthly).length >= 90);
  assert.match(result.last.date, /^20\d{2}-(01|04|07|10)-01$/);
  assert.ok(result.last.value >= 0 && result.last.value <= 100);
  assert.equal(result.worksheetPath, 'xl/worksheets/sheet12.xml');
});
