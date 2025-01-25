import { type TransientTrait } from '../../transient/traits/transient.trait.js';
import { type SignalGetTrait } from './methods/signal.get.trait.js';

/**
 * A `Signal` is a `Transient` associated to a value.
 *
 * This value will _change_ over time, and we'll be able to observe these changes.
 */
export interface SignalTrait<GValue> extends TransientTrait, SignalGetTrait<GValue> {}
