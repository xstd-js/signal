import { type TransientSnapshotChanged } from '../types/transient-snapshot-changed.js';

/**
 * Takes a _snapshot_ of a `Transient`.
 */
export interface TransientTakeSnapshotTrait {
  takeSnapshot(): TransientSnapshotChanged;
}
