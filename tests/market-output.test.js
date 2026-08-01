const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {dataRootFromEnv, writePublishedPair} = require('../scripts/lib/market-output');

test('market output root is injectable for isolated collectors', () => {
  assert.equal(dataRootFromEnv({MARKET_DATA_ROOT: '/tmp/ward-m'}), path.resolve('/tmp/ward-m'));
  assert.equal(dataRootFromEnv({}), path.resolve('data'));
});

test('published JSON and JavaScript are written as a semantic pair', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-output-'));
  writePublishedPair({root, name: 'market', globalName: 'MARKET_DATA', payload: {score: 32}});
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'market.json'), 'utf8')), {score: 32});
  assert.equal(fs.readFileSync(path.join(root, 'market.js'), 'utf8'), 'window.MARKET_DATA={"score":32};\n');
});

test('serialization failure preserves the last valid published pair', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-output-'));
  writePublishedPair({root, name: 'sectors', globalName: 'SECTOR_DATA', payload: {overall: 'CALM'}});
  const beforeJson = fs.readFileSync(path.join(root, 'sectors.json'), 'utf8');
  const beforeJs = fs.readFileSync(path.join(root, 'sectors.js'), 'utf8');
  assert.throws(() => writePublishedPair({root, name: 'sectors', globalName: 'SECTOR_DATA', payload: {bad: 1n}}), /BigInt/);
  assert.equal(fs.readFileSync(path.join(root, 'sectors.json'), 'utf8'), beforeJson);
  assert.equal(fs.readFileSync(path.join(root, 'sectors.js'), 'utf8'), beforeJs);
});

test('second publication rename failure rolls back the complete prior pair', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-output-'));
  writePublishedPair({root, name: 'market', globalName: 'MARKET_DATA', payload: {score: 32}});
  const beforeJson = fs.readFileSync(path.join(root, 'market.json'), 'utf8');
  const beforeJs = fs.readFileSync(path.join(root, 'market.js'), 'utf8');
  let renames = 0;
  const injectedFs = new Proxy(fs, {
    get(target, property) {
      if (property !== 'renameSync') return target[property];
      return (...args) => {
        renames++;
        if (renames === 4) throw new Error('injected JavaScript publication failure');
        return target.renameSync(...args);
      };
    },
  });
  assert.throws(
    () => writePublishedPair({root, name: 'market', globalName: 'MARKET_DATA', payload: {score: 40}, fsImpl: injectedFs}),
    /injected JavaScript publication failure/,
  );
  assert.equal(fs.readFileSync(path.join(root, 'market.json'), 'utf8'), beforeJson);
  assert.equal(fs.readFileSync(path.join(root, 'market.js'), 'utf8'), beforeJs);
});

test('second backup rename failure preserves both original files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-output-'));
  writePublishedPair({root, name: 'market', globalName: 'MARKET_DATA', payload: {score: 32}});
  const beforeJson = fs.readFileSync(path.join(root, 'market.json'), 'utf8');
  const beforeJs = fs.readFileSync(path.join(root, 'market.js'), 'utf8');
  let renames = 0;
  const injectedFs = new Proxy(fs, {
    get(target, property) {
      if (property !== 'renameSync') return target[property];
      return (...args) => {
        renames++;
        if (renames === 2) throw new Error('injected second backup failure');
        return target.renameSync(...args);
      };
    },
  });
  assert.throws(
    () => writePublishedPair({root, name: 'market', globalName: 'MARKET_DATA', payload: {score: 40}, fsImpl: injectedFs}),
    /injected second backup failure/,
  );
  assert.equal(fs.readFileSync(path.join(root, 'market.json'), 'utf8'), beforeJson);
  assert.equal(fs.readFileSync(path.join(root, 'market.js'), 'utf8'), beforeJs);
});

test('both market collectors use retries, injectable roots, and coordinated publication', () => {
  for (const file of ['collect-market.js', 'collect-sectors.js']) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', file), 'utf8');
    assert.match(source, /fetchWithRetry/);
    assert.match(source, /dataRootFromEnv/);
    assert.match(source, /writePublishedPair/);
    assert.doesNotMatch(source, /writeFileSync\(['"]data\//);
  }
});

test('divergence builder publishes market-history JSON and JavaScript as one rollback-safe pair', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts/build-market-divergence.js'), 'utf8');
  assert.match(source, /writePublishedPair\(/);
  assert.doesNotMatch(source, /function writeAtomic/);
});
