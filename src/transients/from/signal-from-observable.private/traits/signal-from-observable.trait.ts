import { type SignalTrait } from '../../../core/signal/traits/signal.trait.js';
import { type SignalFromObservableActivateTrait } from './methods/signal-from-observable.activate.trait.js';
import { type SignalFromObservableActiveTrait } from './properties/signal-from-observable.active.trait.js';

/**
 * A `Signal` whose value comes from an  Observable`.
 */
export interface SignalFromObservableTrait<GValue>
  extends SignalTrait<GValue>,
    SignalFromObservableActiveTrait,
    SignalFromObservableActivateTrait {}
