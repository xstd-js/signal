import { type SignalValueOrError } from '../../../../../signal-value-or-error/signal-value-or-error.js';

/**
 * Sets the `Signal`'s value or error.
 */
export interface WritableSignalSetTrait<GValue> {
  set(value: SignalValueOrError<GValue>): void;
}
