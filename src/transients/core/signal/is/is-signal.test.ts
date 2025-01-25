import { describe, expect, test } from 'vitest';
import { ComputedSignal } from '../../computed-signal/computed-signal.js';
import { WritableSignal } from '../../writable-signal/writable-signal.js';
import { isSignal } from './is-signal.js';

describe('isSignal', () => {
  test('a number is not a signal', () => {
    expect(isSignal(1)).toBe(false);
  });

  test('null is not a signal', () => {
    expect(isSignal(null)).toBe(false);
  });

  test('a WritableSignal is a signal', () => {
    expect(isSignal(new WritableSignal(1))).toBe(true);
  });

  test('a ComputedSignal is a signal', () => {
    expect(isSignal(new ComputedSignal(() => 1))).toBe(true);
  });
});
