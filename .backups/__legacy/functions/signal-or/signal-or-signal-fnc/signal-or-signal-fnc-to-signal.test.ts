import { describe, expect, it } from 'vitest';
import { WritableSignal } from '../../../transients/core/writable-signal/writable-signal.js';
import { signal } from '../../signal/signal.js';
import { signalOrSignalFncToSignal } from './signal-or-signal-fnc-to-signal.js';

describe('signalOrSignalFncToSignal', () => {
  it('works with a WritableSignal', () => {
    expect(signalOrSignalFncToSignal(new WritableSignal(1)) instanceof WritableSignal).toBe(true);
  });

  it('works with a signalFnc', () => {
    expect(signalOrSignalFncToSignal(signal(1)) instanceof WritableSignal).toBe(true);
  });
});
