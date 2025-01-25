import { type SignalValueOrError } from '../../../../signal-value-or-error/signal-value-or-error.js';
import { type SignalTrait } from './signal.trait.js';
import { type SetupSignalValue } from './types/setup-signal-value.js';
import { type SignalOptions } from './types/signal-options.js';

export interface SignalConstructor {
  new <GValue>(
    initialValue: SignalValueOrError<GValue>,
    setupSignalValue: SetupSignalValue<GValue>,
    options?: SignalOptions<GValue>,
  ): SignalTrait<GValue>;
}
