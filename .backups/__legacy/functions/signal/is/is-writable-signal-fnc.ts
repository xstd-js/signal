import { type WritableSignalFnc } from '../types/writable-signal-fnc.js';
import { isSignalFnc } from './is-signal-fnc.js';

export function isWritableSignalFnc<GValue>(input: unknown): input is WritableSignalFnc<GValue> {
  return isSignalFnc(input) && typeof (input as any).set === 'function';
}
