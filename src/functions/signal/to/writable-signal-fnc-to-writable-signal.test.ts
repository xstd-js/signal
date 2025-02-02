import { describe, expect, it } from 'vitest';
import { WritableSignal } from '../../../transients/core/writable-signal/writable-signal.js';
import { signal } from '../signal.js';
import { writableSignalFncToWritableSignal } from './writable-signal-fnc-to-writable-signal.js';

describe('writableSignalFncToWritableSignal', () => {
  it('should return a WritableSignal', () => {
    const a = signal(1);
    const b = writableSignalFncToWritableSignal(a);
    expect(b.get()).toBe(a());
    expect(b instanceof WritableSignal).toBe(true);
  });
});
