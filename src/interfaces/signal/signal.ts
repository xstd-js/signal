import { SIGNAL } from './signal.symbol.ts';

/**
 * Represents a signal: a callable function that returns a value and is able to notify its context when the value changes.
 */
export interface Signal<GValue> {
  (): GValue;

  [SIGNAL]: unknown;
}
