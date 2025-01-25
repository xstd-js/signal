import { type SignalTrait } from '../../../transients/core/signal/traits/signal.trait.js';
import { type WritableSignalTrait } from '../../../transients/core/writable-signal/traits/writable-signal.trait.js';
import { type SignalFnc } from './signal-fnc.js';

export interface WritableSignalFnc<GValue>
  extends SignalFnc<GValue>,
    Omit<WritableSignalTrait<GValue>, keyof SignalTrait<GValue> | 'asReadonly'> {
  asReadonly(): SignalFnc<GValue>;
}
