import { type UndoFunction } from '@xstd/undo-function';
import { Effect } from '../../watchers/effect/effect.js';
import { type EffetFunction } from '../../watchers/effect/traits/types/effet-function.js';

export function effect(effectFunction: EffetFunction): UndoFunction {
  const effect: Effect = new Effect(effectFunction);
  return (): void => {
    effect.stop();
  };
}
