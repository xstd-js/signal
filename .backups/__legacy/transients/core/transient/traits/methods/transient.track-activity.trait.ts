import { type UndoFunction } from '@xstd/undo-function';
import { type TransientActivity } from '../types/transient-activity.js';

/**
 * Creates a listener on the _activity_ of a `Transient`.
 *
 * Returns a function used to cancel this listener.
 */
export interface TransientTrackActivityTrait {
  trackActivity(onActivity: TransientActivity): UndoFunction;
}
