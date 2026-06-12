import { SIGNAL } from './signal.symbol.ts';
import type { Signal } from './signal.ts';

/**
 * Determines whether the provided input is a Signal or not.
 *
 * @param input The value to test for being a Signal.
 * @returns Whether the input is a Signal of the specified type.
 */
export function isSignal<GValue>(input: unknown): input is Signal<GValue> {
  return typeof input === 'function' && Reflect.has(input, SIGNAL);
}
