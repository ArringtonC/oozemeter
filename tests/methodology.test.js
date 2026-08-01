const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FINANCIAL_CONDITIONS_ANCHORS,
  METHODOLOGY_V3_WEIGHTS,
  auto30PlusStress,
  discoverNyFedWorkbookUrl,
  parseNyFedAutoWorkbookParts,
  financialConditionsStress,
  trailingFourWeekByMonth,
  yearOverYear,
} = require('../scripts/lib/methodology');

test('methodology v3 weights sum to 100 with Financial Conditions at 3%', () => {
  assert.equal(Object.values(METHODOLOGY_V3_WEIGHTS).reduce((sum, weight) => sum + weight, 0), 100);
  assert.equal(METHODOLOGY_V3_WEIGHTS.financial, 3);
});

test('maps NFCI monthly means through the approved Financial Conditions anchors', () => {
  assert.deepEqual(FINANCIAL_CONDITIONS_ANCHORS, [
    [-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100],
  ]);
  assert.equal(financialConditionsStress(-0.7), 5);
  assert.equal(financialConditionsStress(0), 40);
  assert.equal(financialConditionsStress(0.15), 47.5);
  assert.equal(financialConditionsStress(3), 100);
});

test('discovers the current NY Fed household-debt data workbook', () => {
  const html = `
    <a href="/medialibrary/interactives/householdcredit/data/pdf/HHDC_2026Q1">Report</a>
    <a href="/medialibrary/interactives/householdcredit/data/xls/HHD_C_Report_2026Q1">Data</a>`;
  assert.equal(
    discoverNyFedWorkbookUrl(html),
    'https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/xls/HHD_C_Report_2026Q1',
  );
});

test('fails closed when the NY Fed workbook link is absent', () => {
  assert.throws(
    () => discoverNyFedWorkbookUrl('<a href="report.pdf">Report only</a>'),
    /NY Fed HHDC data workbook link not found/,
  );
});

test('extracts AUTO 30-plus transition data by sheet and header name', () => {
  const workbookXml = `
    <workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <sheets><sheet name="Page 13 Data" sheetId="12" r:id="rId12"/></sheets>
    </workbook>`;
  const relsXml = `
    <Relationships><Relationship Id="rId12" Target="worksheets/sheet12.xml"/></Relationships>`;
  const sharedStringsXml = `
    <sst><si><t>New Delinquent Balances</t></si><si><t>AUTO</t></si><si><t>CC</t></si>
      <si><t>25:Q4</t></si><si><t>26:Q1</t></si></sst>`;
  const worksheetXml = `
    <worksheet><sheetData>
      <row r="1"><c r="A1" t="s"><v>0</v></c></row>
      <row r="5"><c r="A5"/><c r="B5" t="s"><v>1</v></c><c r="C5" t="s"><v>2</v></c></row>
      <row r="6"><c r="A6" t="s"><v>3</v></c><c r="B6"><v>7.70</v></c><c r="C6"><v>6.1</v></c></row>
      <row r="7"><c r="A7" t="s"><v>4</v></c><c r="B7"><v>7.72</v></c><c r="C7"><v>6.0</v></c></row>
    </sheetData></worksheet>`;
  const result = parseNyFedAutoWorkbookParts({workbookXml, relsXml, sharedStringsXml, worksheetXml});
  assert.deepEqual(result.monthly, {'2025-10': 7.70, '2026-01': 7.72});
  assert.deepEqual(result.last, {date: '2026-01-01', value: 7.72, quarter: '26:Q1'});
  assert.equal(result.worksheetPath, 'xl/worksheets/sheet12.xml');
});

test('fails closed on malformed NY Fed AUTO numeric cells', () => {
  const base = {
    workbookXml: '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Page 13 Data" sheetId="12" r:id="rId12"/></sheets></workbook>',
    relsXml: '<Relationships><Relationship Id="rId12" Target="worksheets/sheet12.xml"/></Relationships>',
    sharedStringsXml: '<sst><si><t>AUTO</t></si><si><t>26:Q1</t></si></sst>',
  };
  for (const rawValue of ['0x10', 'not-a-number', '']) {
    const worksheetXml = `<worksheet><sheetData>
      <row r="5"><c r="B5" t="s"><v>0</v></c></row>
      <row r="6"><c r="A6" t="s"><v>1</v></c><c r="B6"><v>${rawValue}</v></c></row>
    </sheetData></worksheet>`;
    assert.throws(
      () => parseNyFedAutoWorkbookParts({...base, worksheetXml}),
      /invalid AUTO numeric value/i,
    );
  }

  const missingCellXml = `<worksheet><sheetData>
    <row r="5"><c r="B5" t="s"><v>0</v></c></row>
    <row r="6"><c r="A6" t="s"><v>1</v></c></row>
  </sheetData></worksheet>`;
  assert.throws(
    () => parseNyFedAutoWorkbookParts({...base, worksheetXml:missingCellXml}),
    /invalid AUTO numeric value/i,
  );
});

test('fails closed if the AUTO header moves or disappears', () => {
  const parts = {
    workbookXml: '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Page 13 Data" r:id="rId12"/></sheets></workbook>',
    relsXml: '<Relationships><Relationship Id="rId12" Target="worksheets/sheet12.xml"/></Relationships>',
    sharedStringsXml: '<sst><si><t>CC</t></si><si><t>26:Q1</t></si></sst>',
    worksheetXml: '<worksheet><sheetData><row r="5"><c r="B5" t="s"><v>0</v></c></row><row r="6"><c r="A6" t="s"><v>1</v></c><c r="B6"><v>6</v></c></row></sheetData></worksheet>',
  };
  assert.throws(() => parseNyFedAutoWorkbookParts(parts), /AUTO header not found/);
});

test('uses the latest four weekly claims observations available in each month', () => {
  const observations = [
    {date:'2026-03-07', value:100},
    {date:'2026-03-14', value:200},
    {date:'2026-03-21', value:300},
    {date:'2026-03-28', value:400},
    {date:'2026-04-04', value:500},
  ];
  assert.deepEqual(trailingFourWeekByMonth(observations), {
    '2026-03': 250,
    '2026-04': 350,
  });
});

test('does not publish a four-week claims value before four observations exist', () => {
  assert.deepEqual(trailingFourWeekByMonth([
    {date:'2026-03-07', value:100},
    {date:'2026-03-14', value:200},
    {date:'2026-03-21', value:300},
  ]), {});
});

test('maps the NY Fed auto 30-plus flow onto transparent stress anchors', () => {
  assert.equal(auto30PlusStress(4), 5);
  assert.equal(auto30PlusStress(7.5), 40);
  assert.equal(auto30PlusStress(12), 100);
});

test('computes same-month year-over-year percentage change', () => {
  const cpi = {'2025-06': 100, '2026-06': 103.5};
  assert.ok(Math.abs(yearOverYear(cpi, '2026-06') - 3.5) < 1e-9);
  assert.equal(yearOverYear(cpi, '2025-06'), null);
});
