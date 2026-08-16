#!/usr/bin/env node
/* Critic: threshold and rounding boundaries.

   The firing rule is "both moved at least CC_FIRE points". Every inequality is
   a place to be off by one, and every rounded delta is a place where a move
   that was 2.5 becomes 3. StockCharter's critic_drag_bench found a real defect
   at exactly `we==3`; this is the same probe pointed at the cross-check. */
const {attack, report} = require('./harness');
const CG = require('../scripts/lib/claim-gate');
const T = 3;
const cls = (a, b, extra = {}) => CG.classifyRelationship({primaryDelta: a, diagnosticDelta: b, threshold: T, ...extra});

/* exactly at the threshold, opposed — "at least" must include the boundary */
attack('opposed, both exactly at threshold -> CONFLICT', {
  input: {a: 3, b: -3, T}, expected: 'CONFLICT', actual: cls(3, -3),
  falseClaim: 'a genuine contradiction reported as merely mixed',
  rootCause: '>= vs > on the magnitude test'});

/* one hair under — must NOT escalate */
attack('opposed, one a hair under -> MIXED', {
  input: {a: 2.999, b: -3, T}, expected: 'MIXED', actual: cls(2.999, -3),
  falseClaim: 'a sub-threshold move published as a meaningful contradiction'});

/* both under, opposed */
attack('opposed, both under -> MIXED', {
  input: {a: 2, b: -2, T}, expected: 'MIXED', actual: cls(2, -2)});

/* same direction at the boundary must never become conflict */
attack('same direction at threshold -> AGREES', {
  input: {a: 3, b: 3, T}, expected: 'AGREES', actual: cls(3, 3)});

/* negative zero is still zero — a signed zero must not read as a direction */
attack('negative zero is flat, not downward', {
  input: {a: -0, b: 4, T}, expected: 'INSUFFICIENT', actual: cls(-0, 4),
  falseClaim: '"employment fell" on a month it did not move',
  rootCause: 'Object.is(-0,0) is false; a > / < test on -0 can imply direction'});

attack('both negative zero -> AGREES (both flat)', {
  input: {a: -0, b: 0, T}, expected: 'AGREES', actual: cls(-0, 0)});

/* tiny float noise either side of zero must not manufacture a contradiction */
attack('float dust opposed -> not a conflict', {
  input: {a: 1e-9, b: -1e-9, T}, expected: 'MIXED', actual: cls(1e-9, -1e-9),
  falseClaim: 'two series that did not move reported as pointing opposite ways'});

/* extreme values must not overflow into the wrong branch */
attack('extreme opposed values -> CONFLICT', {
  input: {a: 1e6, b: -1e6, T}, expected: 'CONFLICT', actual: cls(1e6, -1e6)});

attack('Infinity is not a measurement', {
  input: {a: Infinity, b: -3, T}, expected: 'INSUFFICIENT', actual: cls(Infinity, -3),
  falseClaim: 'a contradiction asserted from a non-finite delta',
  rootCause: 'Number.isFinite guard missing or applied after the direction test'});

report('critic_boundary');
