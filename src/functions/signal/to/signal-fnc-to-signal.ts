import { type SignalTrait } from '../../../transients/core/signal/traits/signal.trait.js';
import { SIGNAL } from '../signal.symbol.js';
import { type SignalFnc } from '../types/signal-fnc.js';

export function signalFncToSignal<GValue>(input: SignalFnc<GValue>): SignalTrait<GValue> {
  return input[SIGNAL];
}
