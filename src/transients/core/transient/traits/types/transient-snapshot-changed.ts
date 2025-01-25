/**
 * Returns `true` if the `Transient` changed since this _snapshot_ was taken.
 */
export interface TransientSnapshotChanged {
  (): boolean;
}
