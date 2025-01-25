import { type SignalValueOrError } from '../../../../signal-value-or-error/signal-value-or-error.js';
import { type SignalOptions } from '../../../core/signal/traits/types/signal-options.js';
import { type LinkableSignalTrait } from './linkable-signal.trait.js';

export interface LinkableSignalConstructor {
  new <GValue>(
    initialValue: SignalValueOrError<GValue>,
    options?: SignalOptions<GValue>,
  ): LinkableSignalTrait<GValue>;
}
