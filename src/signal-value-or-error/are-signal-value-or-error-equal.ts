import { type EqualFunction } from '@xstd/equal-function';
import { SignalError } from '../signal-error/signal-error.js';
import { type SignalValueOrError } from './signal-value-or-error.js';

export function areSignalValueOrErrorEqual<GValue>(
  valueA: SignalValueOrError<GValue>,
  valueB: SignalValueOrError<GValue>,
  equal: EqualFunction<GValue>,
): boolean {
  return (
    !(valueA instanceof SignalError) && !(valueB instanceof SignalError) && equal(valueA, valueB)
  );
}
