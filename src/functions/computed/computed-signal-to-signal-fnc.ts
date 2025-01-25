import { type ComputedSignal } from '../../transients/core/computed-signal/computed-signal.js';
import { SIGNAL } from '../signal/signal.symbol.js';
import { type SignalFnc } from '../signal/types/signal-fnc.js';

export function computedSignalToSignalFnc<GValue>(
  input: ComputedSignal<GValue>,
): SignalFnc<GValue> {
  const output: SignalFnc<GValue> = ((): GValue => input.get()) as SignalFnc<GValue>;
  output[SIGNAL] = input;

  return output;
}
