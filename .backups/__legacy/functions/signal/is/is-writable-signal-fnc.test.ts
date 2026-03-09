import { describe, expect, it } from 'vitest';
import { signal } from '../signal.js';
import { isWritableSignalFnc } from './is-writable-signal-fnc.js';

describe('isWritableSignalFnc', () => {
  it('is a signal', () => {
    const a = signal(1);
    expect(isWritableSignalFnc(a)).toBe(true);
  });

  it('is not a signal', () => {
    expect(isWritableSignalFnc(1)).toBe(false);
    expect(isWritableSignalFnc({})).toBe(false);
  });
});
