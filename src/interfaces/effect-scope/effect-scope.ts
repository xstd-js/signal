import type { UndoFunction } from '@xstd/undo-function';

/**
 * Describes an effect-scope:
 *
 * A function creating a context where effects are scoped.
 *
 * Returns a function used as _cleanup_ when the effect-scope is stopped.
 */
export interface EffectScope {
  (fn: RunEffectScope): UndoFunction;
}

/**
 * The _context_ function of an effect-scope where effects are scoped.
 */
export interface RunEffectScope {
  (): undefined | void;
}
