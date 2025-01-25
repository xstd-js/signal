import { type SignalValueOrError } from '../../../../../signal-value-or-error/signal-value-or-error.js';

/**
 * Sets the `Signal`'s value.
 *
 * Returns `true` if the value is considered different of the previous one.
 */
export interface SetSignalValue<GValue> {
  (value: SignalValueOrError<GValue>): boolean;
}
