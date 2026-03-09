import { type SignalOrSignalFnc } from '../signal-or-signal-fnc/signal-or-signal-fnc.js';

export type SignalOrValue<GValue> = SignalOrSignalFnc<GValue> | GValue;
