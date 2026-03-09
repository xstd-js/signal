import { type SignalTrait } from '../../../transients/core/signal/traits/signal.trait.js';
import { type SignalFnc } from '../../signal/types/signal-fnc.js';

export type SignalOrSignalFnc<GValue> = SignalTrait<GValue> | SignalFnc<GValue>;
