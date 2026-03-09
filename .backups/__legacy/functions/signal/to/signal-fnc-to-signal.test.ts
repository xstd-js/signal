import { describe, expect, it } from 'vitest';
import { ComputedSignal } from '../../../transients/core/computed-signal/computed-signal.js';
import { computed } from '../../computed/computed.js';
import { signalFncToSignal } from './signal-fnc-to-signal.js';

describe('signalFncToSignal', () => {
  it('should return a ComputedSignal', () => {
    const a = computed(() => 1);
    const b = signalFncToSignal(a);
    expect(b.get()).toBe(a());
    expect(b instanceof ComputedSignal).toBe(true);
  });
});
