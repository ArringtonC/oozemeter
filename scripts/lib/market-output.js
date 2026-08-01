const fs = require('fs');
const path = require('path');

function dataRootFromEnv(env = process.env) {
  return path.resolve(env.MARKET_DATA_ROOT || 'data');
}

function atomicWrite(target, content) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  const temporary = `${target}.tmp-${process.pid}-${Date.now()}`;
  try {
    fs.writeFileSync(temporary, content);
    fs.renameSync(temporary, target);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function writePublishedPair({root, name, globalName, payload, fsImpl = fs}) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid output name: ${name}`);
  if (!/^[A-Z][A-Z0-9_]*$/.test(globalName)) throw new Error(`Invalid global name: ${globalName}`);
  const compact = JSON.stringify(payload);
  const formatted = JSON.stringify(payload, null, 1);
  if (compact === undefined || formatted === undefined) throw new Error('Payload is not serializable');
  fsImpl.mkdirSync(root, {recursive: true});
  const nonce = `${process.pid}-${Date.now()}`;
  const targets = [path.join(root, `${name}.json`), path.join(root, `${name}.js`)];
  const staged = targets.map(target => `${target}.tmp-${nonce}`);
  const backups = targets.map(target => `${target}.bak-${nonce}`);
  const contents = [`${formatted}\n`, `window.${globalName}=${compact};\n`];
  const existed = targets.map(target => fsImpl.existsSync(target));
  const backedUp = targets.map(() => false);
  const published = targets.map(() => false);
  try {
    for (let index = 0; index < staged.length; index++) fsImpl.writeFileSync(staged[index], contents[index]);
    for (let index = 0; index < targets.length; index++) if (existed[index]) {
      fsImpl.renameSync(targets[index], backups[index]);
      backedUp[index] = true;
    }
    for (let index = 0; index < targets.length; index++) {
      fsImpl.renameSync(staged[index], targets[index]);
      published[index] = true;
    }
  } catch (error) {
    for (let index = 0; index < targets.length; index++) {
      if (published[index] && fsImpl.existsSync(targets[index])) fsImpl.unlinkSync(targets[index]);
    }
    for (let index = 0; index < backups.length; index++) {
      if (backedUp[index] && fsImpl.existsSync(backups[index])) fsImpl.renameSync(backups[index], targets[index]);
    }
    throw error;
  } finally {
    for (const temporary of staged) if (fsImpl.existsSync(temporary)) fsImpl.unlinkSync(temporary);
  }
  for (const backup of backups) {
    try { if (fsImpl.existsSync(backup)) fsImpl.unlinkSync(backup); } catch { /* stale backup is safer than rolling back a published pair */ }
  }
}

module.exports = {atomicWrite, dataRootFromEnv, writePublishedPair};
