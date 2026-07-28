const crypto = require('crypto');

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error(`Cannot fingerprint non-finite number: ${value}`);
  }
  return value;
}

function collectionFingerprint(snapshot) {
  const canonical = JSON.stringify(canonicalize(snapshot));
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

module.exports = {canonicalize, collectionFingerprint};
