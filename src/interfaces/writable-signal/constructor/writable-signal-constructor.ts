import type { SignalOptions } from '../../signal/constructor/signal-options.ts';
import type { WritableSignal } from '../writable-signal.ts';

/**
 * Represents a constructor interface for creating writable signals.
 * A writable signal allows the tracking of a value and provides the ability to update that value reactively.
 *
 * @template GValue The type of the value of the writable signal.
 * @param {GValue} initialValue The initial value of the writable signal.
 * @param {SignalOptions<GValue>} [options] Configuration options for the writable signal, such as equality checks.
 * @returns {WritableSignal<GValue>} A writable signal instance that can be used to track and update the specified value.
 */
export interface WritableSignalConstructor {
  <GValue>(initialValue: GValue, options?: SignalOptions<GValue>): WritableSignal<GValue>;
}
