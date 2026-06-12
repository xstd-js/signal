import type { SignalOptions } from '../../signal/constructor/signal-options.ts';
import type { ComputedSignal } from '../computed-signal.ts';

/**
 * Represents a constructor interface for creating a computed signal.
 * A computed signal is a value derived from other signals or data sources.
 *
 * @template GValue The type of the computed signal's value.
 * @param {RunComputed<GValue>} fn A function that computes the value of the signal.
 * It typically depends on other signals.
 * @param {SignalOptions<GValue>} [options] Optional configuration for the computed signal,
 * including features such as equality checks or debugging options.
 * @returns {ComputedSignal<GValue>} The created computed signal instance.
 */
export interface ComputedSignalConstructor {
  <GValue>(fn: RunComputed<GValue>, options?: SignalOptions<GValue>): ComputedSignal<GValue>;
}

/**
 * The _context_ function of a computed signal where signals are observed, and the returned value used as the computed signal's value.
 */
export interface RunComputed<GValue> {
  (): GValue;
}
