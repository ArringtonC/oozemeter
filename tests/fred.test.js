const test = require('node:test');
const assert = require('node:assert/strict');
const {parseFredCsv} = require('../scripts/lib/fred');

test('parses dated FRED observations while preserving exact weekly dates', () => {
  const result = parseFredCsv('observation_date,ICSA\n2026-06-06,220000\n2026-06-13,224000\n', 'ICSA');
  assert.deepEqual(result.observations, [
    {date: '2026-06-06', value: 220000},
    {date: '2026-06-13', value: 224000},
  ]);
  assert.equal(result.monthly['2026-06'], 222000);
  assert.deepEqual(result.last, {date: '2026-06-13', value: 224000});
});

test('fails closed on a malformed FRED numeric field', () => {
  assert.throws(
    () => parseFredCsv('observation_date,UNRATE\n2026-06-01,not-a-number\n', 'UNRATE'),
    /UNRATE: invalid numeric value.*2026-06-01/,
  );
});

test('fails closed when FRED returns no observations', () => {
  assert.throws(() => parseFredCsv('observation_date,CPIAUCNS\n', 'CPIAUCNS'), /CPIAUCNS: no valid observations/);
});
