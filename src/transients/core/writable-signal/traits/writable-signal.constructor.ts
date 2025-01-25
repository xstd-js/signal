import { type SignalValueOrError } from '../../../../signal-value-or-error/signal-value-or-error.js';
import { type SignalOptions } from '../../signal/traits/types/signal-options.js';
import { type WritableSignalStaticThrownTrait } from './static/methods/writable-signal.static.thrown.trait.js';
import { type WritableSignalStaticUnsetTrait } from './static/methods/writable-signal.static.unset.trait.js';
import { type WritableSignalTrait } from './writable-signal.trait.js';

export interface WritableSignalConstructor
  extends WritableSignalStaticUnsetTrait,
    WritableSignalStaticThrownTrait {
  new <GValue>(
    initialValue: SignalValueOrError<GValue>,
    options?: SignalOptions<GValue>,
  ): WritableSignalTrait<GValue>;
}
