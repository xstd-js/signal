import { type UndoFunction } from '@xstd/undo-function';
import { type TransientActivity } from '../../traits/types/transient-activity.js';
import { type TransientSnapshotChanged } from '../../traits/types/transient-snapshot-changed.js';
import { type Transient } from '../../transient.js';
import { type AggregateTransientTrait } from '../traits/aggregate-transient.trait.js';

export class BasicAggregateTransient implements AggregateTransientTrait {
  readonly #list: readonly Transient[];

  constructor(list: readonly Transient[]) {
    this.#list = list;
  }

  takeSnapshot(): TransientSnapshotChanged {
    const transientSnapshotChangedFunctions: readonly TransientSnapshotChanged[] = this.#list.map(
      (transient: Transient): TransientSnapshotChanged => {
        return transient.takeSnapshot();
      },
    );

    return (): boolean => {
      return transientSnapshotChangedFunctions.some(
        (transientSnapshotChanged: TransientSnapshotChanged): boolean => {
          return transientSnapshotChanged();
        },
      );
    };
  }

  trackActivity(onActivity: TransientActivity): UndoFunction {
    const undoFunctions: UndoFunction[] = this.#list.map((transient: Transient): UndoFunction => {
      return transient.trackActivity(onActivity);
    });

    return (): void => {
      for (let i = 0; i < undoFunctions.length; i++) {
        undoFunctions[i]();
      }
      undoFunctions.length = 0;
    };
  }
}
