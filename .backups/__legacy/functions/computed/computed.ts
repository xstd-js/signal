import { ComputedSignal } from '../../transients/core/computed-signal/computed-signal.js';
import { type ComputationFunction } from '../../transients/core/computed-signal/traits/types/computation-function.js';
import { type ComputedSignalOptions } from '../../transients/core/computed-signal/traits/types/computed-signal-options.js';
import { computedSignalFncFromComputedSignal } from './from/computed-signal-fnc-from-computed-signal.js';
import { type ComputedSignalFnc } from './types/computed-signal-fnc.js';

export function computed<GValue>(
  computation: ComputationFunction<GValue>,
  options?: ComputedSignalOptions<GValue>,
): ComputedSignalFnc<GValue> {
  return computedSignalFncFromComputedSignal<GValue>(
    new ComputedSignal<GValue>(computation, options),
  );
}
