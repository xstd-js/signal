import { SIGNAL } from './signal.symbol.ts';
import type { Signal } from './signal.ts';

export function isSignal<GValue>(input: unknown): input is Signal<GValue> {
  return typeof input === 'function' && Reflect.has(input, SIGNAL);
}
