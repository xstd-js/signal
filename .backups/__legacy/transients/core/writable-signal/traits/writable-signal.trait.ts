import { type SignalTrait } from '../../signal/traits/signal.trait.js';
import { type WritableSignalAsReadonlyTrait } from './methods/writable-signal.as-readonly.trait.js';
import { type WritableSignalSetTrait } from './methods/writable-signal.set.trait.js';
import { type WritableSignalThrowTrait } from './methods/writable-signal.throw.trait.js';
import { type WritableSignalUpdateTrait } from './methods/writable-signal.update.trait.js';

/**
 * A `Signal` whose value may be updated using the `.set(...)` method.
 */
export interface WritableSignalTrait<GValue>
  extends SignalTrait<GValue>,
    WritableSignalSetTrait<GValue>,
    WritableSignalThrowTrait,
    WritableSignalUpdateTrait<GValue>,
    WritableSignalAsReadonlyTrait<GValue> {}
