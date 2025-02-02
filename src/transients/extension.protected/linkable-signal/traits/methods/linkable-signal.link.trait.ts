import { type UndoFunction } from '@xstd/undo-function';
import { type SignalTrait } from '../../../../core/signal/traits/signal.trait.js';

export interface LinkableSignalLinkOptions {
  readonly lock?: boolean;
}

/**
 * Links this Signal with `signal`.
 *
 * This Signal will have the exact same value and behaviour as `signal`.
 */
export interface LinkableSignalLinkTrait<GValue> {
  link(signal: SignalTrait<GValue>, options?: LinkableSignalLinkOptions): UndoFunction;
}
