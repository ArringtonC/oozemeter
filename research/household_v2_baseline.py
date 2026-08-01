"""Load the immutable household-only v2 baseline used by decision studies.

Methodology v3 replaced ``backtest-results.json`` with current-revised inputs.
Reconstructing v2 from that moving artifact made the supposedly frozen research
baseline drift after each source revision. This adapter instead loads the exact
pre-v3 canonical backtest retained in ``household-v2-backtest.json``, verifies its
byte fingerprint, and reconciles it with revision record entry #2.
"""

import json
import hashlib
import os

HERE = os.path.dirname(os.path.abspath(__file__))
V2_WEIGHTS = {
    'employment': 25,
    'housing': 20,
    'credit': 20,
    'auto': 15,
    'gas': 10,
    'inflation': 10,
}
V2_CALIBRATION = {'a': 1.4209110232483089, 'b': -24.62145011353958}
FROZEN_V2_BASELINE_SHA256 = '6a7860ef97e04a1252dad4765827c638d1e81759cc4e5046fb80a3d8effcdc11'


def load_household_v2_baseline():
    baseline_path = os.path.join(HERE, 'household-v2-backtest.json')
    with open(baseline_path, 'rb') as source:
        baseline_bytes = source.read()
    fingerprint = hashlib.sha256(baseline_bytes).hexdigest()
    if fingerprint != FROZEN_V2_BASELINE_SHA256:
        raise RuntimeError(f'Frozen v2 study artifact fingerprint changed: {fingerprint}')
    baseline = json.loads(baseline_bytes)

    with open(os.path.join(HERE, '..', 'data', 'revisions.json'), encoding='utf-8') as source:
        revisions = json.load(source)

    revision = next((entry for entry in revisions if entry.get('toMethodologyVersion') == '3.0.0'), None)
    if revision is None:
        raise RuntimeError('Methodology v3 revision record is required to validate the v2 study baseline')
    comparison_months = revision.get('summary', {}).get('monthsCompared')
    if not isinstance(comparison_months, int) or comparison_months <= 0:
        raise RuntimeError('Methodology v3 revision record is missing the frozen comparison-month count')
    monthly = baseline.get('monthly', [])
    if len(monthly) != comparison_months:
        raise RuntimeError(f'Frozen v2 baseline expected {comparison_months} months, found {len(monthly)}')
    if baseline.get('weights') != V2_WEIGHTS:
        raise RuntimeError('Frozen v2 study weights changed')
    calibration = baseline.get('calibration', {})
    if calibration.get('a') != V2_CALIBRATION['a'] or calibration.get('b') != V2_CALIBRATION['b']:
        raise RuntimeError('Frozen v2 study calibration changed')

    by_month = {row['month']: row['ooze'] for row in monthly}
    for change in revision.get('changes', []):
        year = int(change['t'])
        month = round((change['t'] - year) * 12) + 1
        key = f'{year}-{month:02d}'
        if by_month.get(key) != change['old']:
            raise RuntimeError(f'Frozen v2 revision mismatch at {key}: {by_month.get(key)} != {change["old"]}')

    return {'weights': V2_WEIGHTS, 'calibration': V2_CALIBRATION, 'monthly': monthly}


if __name__ == '__main__':
    baseline = load_household_v2_baseline()
    print(f"validated frozen methodology v2 baseline: {len(baseline['monthly'])} months")
