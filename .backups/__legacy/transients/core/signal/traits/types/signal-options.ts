import { type EqualFunction } from '@xstd/equal-function';

/**
 * The options to provide to a `Signal`.
 */
export interface SignalOptions<GValue> {
  // a function to compare 2 values. returns `true` if both a _equal_.
  readonly equal?: EqualFunction<GValue>;
}
