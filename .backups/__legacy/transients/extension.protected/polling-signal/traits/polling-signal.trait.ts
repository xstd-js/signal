import { type SignalTrait } from '../../../core/signal/traits/signal.trait.js';

/**
 * A `Signal` whose value is frequently polled from a `read` function.
 */
export interface PollingSignalTrait<GValue> extends SignalTrait<GValue> {}
