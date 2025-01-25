import { type SetSignalValue } from './set-signal-value.js';
import { type UpdateSignalValue } from './update-signal-value.js';

/**
 * A function called immediately by the `Signal`'s constructor, used to set the `Signal`'s value.
 */
export interface SetupSignalValue<GValue> {
  (set: SetSignalValue<GValue>): UpdateSignalValue | void;
}
