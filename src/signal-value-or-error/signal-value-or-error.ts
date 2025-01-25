import { type SignalError } from '../signal-error/signal-error.js';

/**
 * A value or a `SignalError`.
 */
export type SignalValueOrError<GValue> = GValue | SignalError;
