import { type SignalValueOrError } from '../../signal-value-or-error/signal-value-or-error.js';
import { type SignalUpdateFunctionCallback } from '../../transients/core/writable-signal/traits/types/signal-update-function-callback.js';
import { type WritableSignal } from '../../transients/core/writable-signal/writable-signal.js';
import { SIGNAL } from './signal.symbol.js';
import { type SignalFnc } from './types/signal-fnc.js';
import { type WritableSignalFnc } from './types/writable-signal-fnc.js';

export function writableSignalToWritableSignalFnc<GValue>(
  input: WritableSignal<GValue>,
): WritableSignalFnc<GValue> {
  const output: WritableSignalFnc<GValue> = ((): GValue =>
    input.get()) as WritableSignalFnc<GValue>;
  output[SIGNAL] = input;

  output.set = (value: SignalValueOrError<GValue>): void => input.set(value);
  output.throw = (error: unknown): void => input.throw(error);
  output.update = (updateFunction: SignalUpdateFunctionCallback<GValue>): void =>
    input.update(updateFunction);
  output.asReadonly = (): SignalFnc<GValue> => {
    const output: WritableSignalFnc<GValue> = ((): GValue =>
      input.get()) as WritableSignalFnc<GValue>;
    output[SIGNAL] = input;
    return output;
  };

  return output;
}
