import { describe, expect, it } from 'vitest';
import { signal } from '../signal.js';
import { isSignalFnc } from './is-signal-fnc.js';

describe('isSignalFnc', () => {
  it('is a readonly signal', () => {
    const a = signal(1);
    expect(isSignalFnc(a)).toBe(true);
  });

  it('is not a readonly signal', () => {
    expect(isSignalFnc(1)).toBe(false);
    expect(isSignalFnc({})).toBe(false);
  });
});
