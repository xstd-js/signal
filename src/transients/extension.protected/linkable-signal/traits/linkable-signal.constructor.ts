import { type SignalValueOrError } from '../../../../signal-value-or-error/signal-value-or-error.js';
import { type LinkableSignalTrait } from './linkable-signal.trait.js';
import { type LinkableSignalOptions } from './types/linkable-signal-options.js';

export interface LinkableSignalConstructor {
  unset<GValue>(options?: LinkableSignalOptions<GValue>): LinkableSignalTrait<GValue>;

  thrown<GValue>(
    error: unknown,
    options?: LinkableSignalOptions<GValue>,
  ): LinkableSignalTrait<GValue>;

  new <GValue>(
    initialValue: SignalValueOrError<GValue>,
    options?: LinkableSignalOptions<GValue>,
  ): LinkableSignalTrait<GValue>;
}
