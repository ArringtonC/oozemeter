const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');
const {fetchWithRetry} = require('./fetch');

const NY_FED_IFRAME = 'https://www.newyorkfed.org/householdcredit/hhdc-iframe';
const NY_FED_ORIGIN = 'https://www.newyorkfed.org';
const AUTO_30_PLUS_ANCHORS = [[5,5],[6,15],[7,30],[8,50],[9,70],[10,85],[11,95],[12,100]];
const FINANCIAL_CONDITIONS_ANCHORS = [[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]];
const METHODOLOGY_V3_WEIGHTS = Object.freeze({
  employment: 24.25,
  housing: 19.40,
  credit: 19.40,
  auto: 14.55,
  gas: 9.70,
  inflation: 9.70,
  financial: 3.00,
});

/* Frozen calibration for methodology v3.0.0 — the single source of truth for
   both the backtest and the collector. Derived once (calm 2003-2025 → 10,
   GFC peak → 90) and frozen deliberately: sources revise, so re-deriving on
   every run would silently move already-published historical scores. Changing
   these two numbers restates the public record and is a methodology version
   bump, not a maintenance edit. Re-derive with OOZEMETER_RECALIBRATE=1. */
const CALIBRATION_V3 = Object.freeze({a: 1.418684348943213, b: -23.96514845099034});

function parseProviderNumber(rawValue, label) {
  if (typeof rawValue !== 'string' || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(rawValue)) {
    throw new Error(`Invalid ${label} numeric value: ${JSON.stringify(rawValue)}`);
  }
  const value = Number(rawValue);
  if (!Number.isFinite(value)) throw new Error(`Invalid ${label} numeric value: ${JSON.stringify(rawValue)}`);
  return value;
}

function interpolateAnchors(anchors, value) {
  if (!Number.isFinite(value)) throw new Error(`Cannot interpolate non-finite value: ${value}`);
  if (value <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (value >= last[0]) return last[1];
  for (let index = 0; index < anchors.length - 1; index += 1) {
    const [x1, y1] = anchors[index];
    const [x2, y2] = anchors[index + 1];
    if (value >= x1 && value <= x2) return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
  }
  throw new Error(`Unable to interpolate value: ${value}`);
}

function financialConditionsStress(value) {
  return interpolateAnchors(FINANCIAL_CONDITIONS_ANCHORS, value);
}

function decodeXml(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function attributes(source) {
  const output = {};
  for (const match of source.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    output[match[1]] = decodeXml(match[2]);
  }
  return output;
}

function discoverNyFedWorkbookUrl(html) {
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = attributes(match[1]);
    if (!attrs.href) continue;
    if (/HHD_C_Report_\d{4}Q[1-4](?:\.xlsx)?(?:[?#].*)?$/i.test(attrs.href)) {
      return new URL(attrs.href, NY_FED_ORIGIN).href;
    }
  }
  throw new Error('NY Fed HHDC data workbook link not found');
}

function sharedStrings(xml) {
  const output = [];
  for (const item of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)) {
    const fragments = [...item[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)];
    output.push(fragments.map(fragment => decodeXml(fragment[1])).join(''));
  }
  return output;
}

function resolveWorksheetPath(workbookXml, relsXml, sheetName) {
  let relationshipId = null;
  for (const sheet of workbookXml.matchAll(/<sheet\b([^>]*)\/?\s*>/gi)) {
    const attrs = attributes(sheet[1]);
    if (attrs.name === sheetName) {
      relationshipId = attrs['r:id'];
      break;
    }
  }
  if (!relationshipId) throw new Error(`${sheetName} worksheet not found`);

  let target = null;
  for (const relationship of relsXml.matchAll(/<Relationship\b([^>]*)\/?\s*>/gi)) {
    const attrs = attributes(relationship[1]);
    if (attrs.Id === relationshipId) {
      target = attrs.Target;
      break;
    }
  }
  if (!target) throw new Error(`${sheetName} worksheet relationship not found`);
  if (target.startsWith('/')) return target.slice(1);
  if (target.startsWith('xl/')) return target;
  return `xl/${target}`;
}

function worksheetCells(xml, strings) {
  const output = {};
  for (const cell of xml.matchAll(/<c\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/c>)/gi)) {
    const attrs = attributes(cell[1]);
    if (!attrs.r || !cell[2]) continue;
    const valueMatch = cell[2].match(/<v\b[^>]*>([\s\S]*?)<\/v>/i);
    if (!valueMatch) continue;
    let value = decodeXml(valueMatch[1]);
    if (attrs.t === 's') value = strings[Number(value)];
    output[attrs.r] = value;
  }
  return output;
}

function quarterToMonth(quarter) {
  const match = /^(\d{2}):Q([1-4])$/.exec(quarter);
  if (!match) throw new Error(`Unexpected NY Fed quarter label: ${quarter}`);
  const year = Number(match[1]) >= 80 ? 1900 + Number(match[1]) : 2000 + Number(match[1]);
  const month = 1 + (Number(match[2]) - 1) * 3;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function parseNyFedAutoWorkbookParts({workbookXml, relsXml, sharedStringsXml, worksheetXml}) {
  const worksheetPath = resolveWorksheetPath(workbookXml, relsXml, 'Page 13 Data');
  const strings = sharedStrings(sharedStringsXml);
  const cells = worksheetCells(worksheetXml, strings);
  const autoHeader = Object.entries(cells).find(([, value]) => String(value).trim() === 'AUTO');
  if (!autoHeader) {
    const rowFive = Object.entries(cells).filter(([reference]) => /5$/.test(reference));
    throw new Error(`AUTO header not found in NY Fed Page 13 Data; row 5: ${JSON.stringify(rowFive)}`);
  }
  const autoColumn = autoHeader[0].match(/^[A-Z]+/)[0];
  const monthly = {};
  let last = null;

  for (const [reference, rawQuarter] of Object.entries(cells)) {
    if (!/^A\d+$/.test(reference) || !/^\d{2}:Q[1-4]$/.test(String(rawQuarter))) continue;
    const row = reference.match(/\d+$/)[0];
    const rawValue = cells[`${autoColumn}${row}`];
    const value = parseProviderNumber(rawValue, 'AUTO');
    const month = quarterToMonth(rawQuarter);
    monthly[month] = value;
    last = {date: `${month}-01`, value, quarter: rawQuarter};
  }
  if (!last) throw new Error('No AUTO observations found in NY Fed Page 13 Data');
  return {monthly, last, worksheetPath};
}

function unzipEntry(workbookPath, entry) {
  return execFileSync('unzip', ['-p', workbookPath, entry], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
}

function parseNyFedAutoWorkbook(workbookPath) {
  const workbookXml = unzipEntry(workbookPath, 'xl/workbook.xml');
  const relsXml = unzipEntry(workbookPath, 'xl/_rels/workbook.xml.rels');
  const sharedStringsXml = unzipEntry(workbookPath, 'xl/sharedStrings.xml');
  const worksheetPath = resolveWorksheetPath(workbookXml, relsXml, 'Page 13 Data');
  const worksheetXml = unzipEntry(workbookPath, worksheetPath);
  return parseNyFedAutoWorkbookParts({workbookXml, relsXml, sharedStringsXml, worksheetXml});
}

async function fetchNyFedAutoSeries() {
  const landingResponse = await fetchWithRetry(NY_FED_IFRAME, {headers: {'user-agent': 'OOZEMeter/0.2'}});
  if (!landingResponse.ok) throw new Error(`NY Fed HHDC iframe: HTTP ${landingResponse.status}`);
  const sourceUrl = discoverNyFedWorkbookUrl(await landingResponse.text());
  const workbookResponse = await fetchWithRetry(sourceUrl, {headers: {'user-agent': 'OOZEMeter/0.2'}});
  if (!workbookResponse.ok) throw new Error(`NY Fed HHDC workbook: HTTP ${workbookResponse.status}`);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oozemeter-nyfed-'));
  const workbookPath = path.join(tempDir, 'household-debt-credit.xlsx');
  try {
    fs.writeFileSync(workbookPath, Buffer.from(await workbookResponse.arrayBuffer()));
    return {...parseNyFedAutoWorkbook(workbookPath), sourceUrl};
  } finally {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
}

function trailingFourWeekByMonth(observations) {
  const ordered = [...observations].sort((a, b) => a.date.localeCompare(b.date));
  const monthly = {};
  for (let index = 3; index < ordered.length; index += 1) {
    const window = ordered.slice(index - 3, index + 1);
    if (window.some(item => !Number.isFinite(item.value))) continue;
    const month = ordered[index].date.slice(0, 7);
    monthly[month] = window.reduce((sum, item) => sum + item.value, 0) / 4;
  }
  return monthly;
}

function auto30PlusStress(value) {
  if (value <= AUTO_30_PLUS_ANCHORS[0][0]) return AUTO_30_PLUS_ANCHORS[0][1];
  const last = AUTO_30_PLUS_ANCHORS[AUTO_30_PLUS_ANCHORS.length - 1];
  if (value >= last[0]) return last[1];
  for (let index = 0; index < AUTO_30_PLUS_ANCHORS.length - 1; index += 1) {
    const [x1, y1] = AUTO_30_PLUS_ANCHORS[index];
    const [x2, y2] = AUTO_30_PLUS_ANCHORS[index + 1];
    if (value >= x1 && value <= x2) return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
  }
  throw new Error(`Unable to score NY Fed auto 30+ value: ${value}`);
}

function yearOverYear(monthly, month) {
  const previous = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`;
  const currentValue = monthly[month];
  const previousValue = monthly[previous];
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue) || previousValue === 0) return null;
  return (currentValue / previousValue - 1) * 100;
}

module.exports = {
  AUTO_30_PLUS_ANCHORS,
  CALIBRATION_V3,
  FINANCIAL_CONDITIONS_ANCHORS,
  METHODOLOGY_V3_WEIGHTS,
  auto30PlusStress,
  discoverNyFedWorkbookUrl,
  fetchNyFedAutoSeries,
  financialConditionsStress,
  interpolateAnchors,
  parseNyFedAutoWorkbook,
  parseNyFedAutoWorkbookParts,
  trailingFourWeekByMonth,
  yearOverYear,
};
