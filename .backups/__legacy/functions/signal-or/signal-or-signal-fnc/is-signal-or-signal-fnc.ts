import { isSignal } from '../../../transients/core/signal/is/is-signal.js';
import { isSignalFnc } from '../../signal/is/is-signal-fnc.js';
import { type SignalOrSignalFnc } from './signal-or-signal-fnc.js';

export function isSignalOrSignalFnc<GValue>(input: unknown): input is SignalOrSignalFnc<GValue> {
  return isSignalFnc(input) || isSignal(input);
}
