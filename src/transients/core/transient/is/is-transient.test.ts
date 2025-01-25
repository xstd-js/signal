import { describe, expect, test } from 'vitest';
import { ComputedSignal } from '../../computed-signal/computed-signal.js';
import { WritableSignal } from '../../writable-signal/writable-signal.js';
import { isTransient } from './is-transient.js';

describe('isTransient', () => {
  test('a number is not a transient', () => {
    expect(isTransient(1)).toBe(false);
  });

  test('null is not a transient', () => {
    expect(isTransient(null)).toBe(false);
  });

  test('a WritableSignal is a transient', () => {
    expect(isTransient(new WritableSignal(1))).toBe(true);
  });

  test('a ComputedSignal is a transient', () => {
    expect(isTransient(new ComputedSignal(() => 1))).toBe(true);
  });
});
