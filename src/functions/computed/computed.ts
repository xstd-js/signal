import { ComputedSignal } from '../../transients/core/computed-signal/computed-signal.js';
import { type ComputationFunction } from '../../transients/core/computed-signal/traits/types/computation-function.js';
import { type ComputedSignalOptions } from '../../transients/core/computed-signal/traits/types/computed-signal-options.js';
import { type SignalFnc } from '../signal/types/signal-fnc.js';
import { computedSignalToSignalFnc } from './computed-signal-to-signal-fnc.js';

export function computed<GValue>(
  computation: ComputationFunction<GValue>,
  options?: ComputedSignalOptions<GValue>,
): SignalFnc<GValue> {
  return computedSignalToSignalFnc<GValue>(new ComputedSignal<GValue>(computation, options));
}
