import { type SignalTrait } from '../../../signal/traits/signal.trait.js';

/**
 * Returns a _readonly_ `Signal` from a `WritableSignal`.
 */
export interface WritableSignalAsReadonlyTrait<GValue> {
  asReadonly(): SignalTrait<GValue>;
}
