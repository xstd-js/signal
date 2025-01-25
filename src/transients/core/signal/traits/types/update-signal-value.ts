/**
 * A function called when the `Signal`'s value is requested.
 *
 * It gives the opportunity to _lazy_ update this value, right before it is requested.
 */
export interface UpdateSignalValue {
  (): void;
}
