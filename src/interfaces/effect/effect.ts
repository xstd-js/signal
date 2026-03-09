import type { UndoFunction } from '@xstd/undo-function';

export interface RunEffect {
  (): void;
}

export interface Effect {
  (fn: RunEffect): UndoFunction;
}
