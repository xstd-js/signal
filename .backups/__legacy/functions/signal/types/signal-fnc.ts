import { type SignalTrait } from '../../../transients/core/signal/traits/signal.trait.js';
import { SIGNAL } from '../signal.symbol.js';

export interface SignalFnc<GValue> {
  (): GValue;

  [SIGNAL]: SignalTrait<GValue>;
}
