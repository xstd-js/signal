import { isSignal } from '../../../transients/core/signal/is/is-signal.js';
import { SignalTrait } from '../../../transients/core/signal/traits/signal.trait.js';
import { ConstSignal } from '../../../transients/extension.protected/const-signal/const-signal.js';
import { isSignalFnc } from '../../signal/is/is-signal-fnc.js';
import { SIGNAL } from '../../signal/signal.symbol.js';
import type { SignalOrValue } from './signal-or-value.js';

export function signalOrValueToSignal<GValue>(input: SignalOrValue<GValue>): SignalTrait<GValue> {
  return isSignalFnc(input)
    ? input[SIGNAL]
    : isSignal(input)
      ? input
      : new ConstSignal<GValue>(input);
}
