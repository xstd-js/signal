import { describe, expect, it } from 'vitest';
import { WritableSignal } from '../../../transients/core/writable-signal/writable-signal.js';
import { signal } from '../../signal/signal.js';
import { isSignalOrSignalFnc } from './is-signal-or-signal-fnc.js';

describe('isSignalOrSignalFnc', () => {
  it('is a signal', () => {
    expect(isSignalOrSignalFnc(new WritableSignal(1))).toBe(true);
  });

  it('is a signalFnc', () => {
    expect(isSignalOrSignalFnc(signal(1))).toBe(true);
  });

  it('is not a signal or signalFnc', () => {
    expect(isSignalOrSignalFnc(1)).toBe(false);
    expect(isSignalOrSignalFnc({})).toBe(false);
  });
});
