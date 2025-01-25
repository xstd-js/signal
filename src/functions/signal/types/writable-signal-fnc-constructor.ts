import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { type SignalOptions } from '../../../transients/core/signal/traits/types/signal-options.js';
import { type WritableSignalFnc } from './writable-signal-fnc.js';

export interface WritableSignalFncConstructor {
  <GValue>(
    initialValue: SignalValueOrError<GValue>,
    options?: SignalOptions<GValue>,
  ): WritableSignalFnc<GValue>;

  unset<GValue>(options?: SignalOptions<GValue>): WritableSignalFnc<GValue>;

  thrown<GValue>(error: unknown, options?: SignalOptions<GValue>): WritableSignalFnc<GValue>;
}
