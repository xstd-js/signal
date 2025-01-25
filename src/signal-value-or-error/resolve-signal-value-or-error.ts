import { SignalError } from '../signal-error/signal-error.js';
import { type SignalValueOrError } from './signal-value-or-error.js';

export function resolveSignalValueOrError<GValue>(
  value: SignalValueOrError<GValue>,
): GValue | never {
  if (value instanceof SignalError) {
    throw value.error;
  }
  return value;
}
