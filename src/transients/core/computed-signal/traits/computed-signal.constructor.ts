import { type ComputedSignalTrait } from './computed-signal.trait.js';
import { type ComputationFunction } from './types/computation-function.js';
import { type ComputedSignalOptions } from './types/computed-signal-options.js';

export interface ComputedSignalConstructor {
  new <GValue>(
    computation: ComputationFunction<GValue>,
    options?: ComputedSignalOptions<GValue>,
  ): ComputedSignalTrait<GValue>;
}
