import { type SignalTrait } from '../../../transients/core/signal/traits/signal.trait.js';
import { SIGNAL } from '../../signal/signal.symbol.js';
import { type SignalOrSignalFnc } from './signal-or-signal-fnc.js';

export function signalOrSignalFncToSignal<GValue>(
  input: SignalOrSignalFnc<GValue>,
): SignalTrait<GValue> {
  return SIGNAL in input ? input[SIGNAL] : input;
}
