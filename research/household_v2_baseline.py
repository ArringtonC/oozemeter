"""Reconstruct the frozen household-only v2 baseline from the canonical v3 backtest.

The market decision studies add candidate signals to the pre-v3 household score.
After methodology v3 replaced ``backtest-results.json``, reading that artifact
directly would count Financial Conditions twice. This adapter deliberately uses
the frozen v2 weights and calibration, then proves every reconstructed integer
against revision record entry #2 before returning the study input.
"""

import json
import hashlib
import math
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
FROZEN_V2_BASELINE_SHA256 = 'c9c4942519a018be4bc61a6c1ded6d5fdccdd6861159928a945c0bc6b6d8ee09'


def _history_key(month):
    year, number = map(int, month.split('-'))
    return f'{year + (number - 1) / 12:.3f}'


def _js_round(value):
    return math.floor(value + 0.5)


def load_household_v2_baseline():
    with open(os.path.join(HERE, 'backtest-results.json'), encoding='utf-8') as source:
        current = json.load(source)
    with open(os.path.join(HERE, '..', 'data', 'revisions.json'), encoding='utf-8') as source:
        revisions = json.load(source)

    revision = next((entry for entry in revisions if entry.get('toMethodologyVersion') == '3.0.0'), None)
    if revision is None:
        raise RuntimeError('Methodology v3 revision record is required to validate the v2 study baseline')
    expected_old = {f"{change['t']:.3f}": change['old'] for change in revision['changes']}

    comparison_months = revision.get('summary', {}).get('monthsCompared')
    if not isinstance(comparison_months, int) or comparison_months <= 0:
        raise RuntimeError('Methodology v3 revision record is missing the frozen comparison-month count')

    monthly = []
    for current_row in current['monthly'][:comparison_months]:
        stresses = current_row['stresses']
        missing = [name for name in V2_WEIGHTS if name not in stresses]
        if missing:
            raise RuntimeError(f"Cannot reconstruct v2 baseline for {current_row['month']}; missing {missing}")
        raw = sum(V2_WEIGHTS[name] * stresses[name] for name in V2_WEIGHTS) / 100
        unrounded = V2_CALIBRATION['a'] * raw + V2_CALIBRATION['b']
        ooze = _js_round(max(0, min(100, unrounded)))
        expected = expected_old.get(_history_key(current_row['month']), current_row['ooze'])
        if ooze != expected:
            raise RuntimeError(
                f"Frozen v2 reconstruction mismatch at {current_row['month']}: {ooze} != {expected}"
            )
        monthly.append({**current_row, 'ooze': ooze})

    if len(monthly) != comparison_months:
        raise RuntimeError(f'Frozen v2 baseline expected {comparison_months} months, found {len(monthly)}')

    fingerprint_rows = []
    for row in monthly:
        raw = sum(V2_WEIGHTS[name] * row['stresses'][name] for name in V2_WEIGHTS) / 100
        fingerprint_rows.append({'month': row['month'], 'raw': raw, 'ooze': row['ooze']})
    fingerprint_payload = {
        'weights': V2_WEIGHTS,
        'calibration': V2_CALIBRATION,
        'monthly': fingerprint_rows,
    }
    fingerprint = hashlib.sha256(
        json.dumps(fingerprint_payload, sort_keys=True, separators=(',', ':')).encode()
    ).hexdigest()
    if fingerprint != FROZEN_V2_BASELINE_SHA256:
        raise RuntimeError(f'Frozen v2 study baseline fingerprint changed: {fingerprint}')

    return {'weights': V2_WEIGHTS, 'calibration': V2_CALIBRATION, 'monthly': monthly}


if __name__ == '__main__':
    baseline = load_household_v2_baseline()
    print(f"validated frozen methodology v2 baseline: {len(baseline['monthly'])} months")
