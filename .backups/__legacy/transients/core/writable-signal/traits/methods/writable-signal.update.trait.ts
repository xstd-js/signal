import { type SignalUpdateFunctionCallback } from '../types/signal-update-function-callback.js';

/**
 * Updates the `Signal`'s value.
 */
export interface WritableSignalUpdateTrait<GValue> {
  update(updateFunction: SignalUpdateFunctionCallback<GValue>): void;
}
