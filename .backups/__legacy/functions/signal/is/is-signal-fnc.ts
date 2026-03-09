import { SIGNAL } from '../signal.symbol.js';
import { type SignalFnc } from '../types/signal-fnc.js';

export function isSignalFnc<GValue>(input: unknown): input is SignalFnc<GValue> {
  return typeof input === 'function' && SIGNAL in input;
}
