import { SignalError } from '../../signal-error/signal-error.js';
import { type SignalValueOrError } from '../../signal-value-or-error/signal-value-or-error.js';
import { type SignalOptions } from '../../transients/core/signal/traits/types/signal-options.js';
import { WritableSignal } from '../../transients/core/writable-signal/writable-signal.js';
import { type WritableSignalFncConstructor } from './types/writable-signal-fnc-constructor.js';
import { type WritableSignalFnc } from './types/writable-signal-fnc.js';
import { writableSignalToWritableSignalFnc } from './writable-signal-to-writable-signal-fnc.js';

export const signal: WritableSignalFncConstructor = (<GValue>(
  initialValue: SignalValueOrError<GValue>,
  options?: SignalOptions<GValue>,
): WritableSignalFnc<GValue> => {
  return writableSignalToWritableSignalFnc<GValue>(
    new WritableSignal<GValue>(initialValue, options),
  );
}) as WritableSignalFncConstructor;

signal.unset = <GValue>(options?: SignalOptions<GValue>): WritableSignalFnc<GValue> => {
  return signal<GValue>(SignalError.UNSET, options);
};

signal.thrown = <GValue>(
  error: unknown,
  options?: SignalOptions<GValue>,
): WritableSignalFnc<GValue> => {
  return signal<GValue>(new SignalError(error), options);
};
