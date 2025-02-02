import { type WritableSignalTrait } from '../../../transients/core/writable-signal/traits/writable-signal.trait.js';
import { SIGNAL } from '../signal.symbol.js';
import { type WritableSignalFnc } from '../types/writable-signal-fnc.js';

export function writableSignalFncToWritableSignal<GValue>(
  input: WritableSignalFnc<GValue>,
): WritableSignalTrait<GValue> {
  return input[SIGNAL] as WritableSignalTrait<GValue>;
}
