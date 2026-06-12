import { describe, expect, it } from 'vitest';
import { computed, signal } from '../../implementation/reactive-system.ts';
import { isSignal } from './is-signal.ts';

describe('isSignal', () => {
  it('signal should be a signal', () => {
    expect(isSignal(signal(1))).toBe(true);
  });

  it('computed should be a signal', () => {
    expect(isSignal(computed(() => 1))).toBe(true);
  });

  it('other values should not be signals', () => {
    expect(isSignal(true)).toBe(false);
    expect(isSignal(1)).toBe(false);
    expect(isSignal({})).toBe(false);
  });
});
