/**
 * Returns the `Signal`'s value.
 *
 * If it is called in a _capture context_ (`Transient.runInContext(...)`), then the `Signal` is captured in this process.
 */
export interface SignalGetTrait<GValue> {
  get(): GValue;
}
