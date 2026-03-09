import { type SignalOptions } from '../../../../signal/traits/types/signal-options.js';
import { type WritableSignalTrait } from '../../writable-signal.trait.js';

/**
 * Creates a `WritableSignal` in an "unset" state.
 *
 * If `.get()` is called before the Signal's value is updated, then an "unset" `Error` is thrown.
 */
export interface WritableSignalStaticUnsetTrait {
  unset<GValue>(options?: SignalOptions<GValue>): WritableSignalTrait<GValue>;
}
