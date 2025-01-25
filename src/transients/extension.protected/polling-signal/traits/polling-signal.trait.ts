import { type SignalTrait } from '../../../core/signal/traits/signal.trait.js';
import { type PollingSignalActivateTrait } from './methods/polling-signal.activate.trait.js';
import { type PollingSignalActiveTrait } from './properties/polling-signal.active.trait.js';

/**
 * A `Signal` whose value is frequently polled from a `read` function.
 */
export interface PollingSignalTrait<GValue>
  extends SignalTrait<GValue>,
    PollingSignalActiveTrait,
    PollingSignalActivateTrait {}
