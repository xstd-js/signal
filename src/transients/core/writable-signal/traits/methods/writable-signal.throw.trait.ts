/**
 * Marks the `Signal` as errored.
 */
export interface WritableSignalThrowTrait {
  throw(error: unknown): void;
}
