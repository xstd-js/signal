import type { UndoFunction } from '@xstd/undo-function';

/**
 * Describes an effect:
 *
 * A function creating a context where signals can be observed.
 *
 * Returns a function used as _cleanup_ when the effect is cleared or on the verge to run again due to signal changes.
 */
export interface Effect {
  (fn: RunEffect): UndoFunction;
}

/**
 * The _context_ function of an effect where signals are observed.
 */
export interface RunEffect {
  (): UndoFunction | undefined;
}
