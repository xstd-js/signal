import { type SignalOptions } from '../../../../signal/traits/types/signal-options.js';
import { type WritableSignalTrait } from '../../writable-signal.trait.js';

/**
 * Creates a `WritableSignal` in an "error" state.
 *
 * If `.get()` is called before the Signal's value is updated, then `error` is thrown.
 */
export interface WritableSignalStaticThrownTrait {
  thrown<GValue>(error: unknown, options?: SignalOptions<GValue>): WritableSignalTrait<GValue>;
}
