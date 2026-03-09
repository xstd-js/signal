import { type ComputedSignal } from '../../../transients/core/computed-signal/computed-signal.js';
import { SIGNAL } from '../../signal/signal.symbol.js';
import { type ComputedSignalFnc } from '../types/computed-signal-fnc.js';

export function computedSignalFncFromComputedSignal<GValue>(
  input: ComputedSignal<GValue>,
): ComputedSignalFnc<GValue> {
  const output: ComputedSignalFnc<GValue> = ((): GValue =>
    input.get()) as ComputedSignalFnc<GValue>;
  output[SIGNAL] = input;

  return output;
}
