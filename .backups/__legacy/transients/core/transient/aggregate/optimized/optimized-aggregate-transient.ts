import { noop } from '@xstd/noop';
import { type UndoFunction } from '@xstd/undo-function';
import { type TransientActivity } from '../../traits/types/transient-activity.js';
import { type TransientSnapshotChanged } from '../../traits/types/transient-snapshot-changed.js';
import { type Transient } from '../../transient.js';
import { type AggregateTransientTrait } from '../traits/aggregate-transient.trait.js';

/**
 * This a specialized and optimized version of an `AggregateTransientTrait`.
 *
 * Usually, to perform a change detection cycle, we have to:
 *
 * 1) track all the Transients
 * 2) check changes on all of them when activity is detected
 * 3) untrack all of them in case of changes
 *
 * We may improve this process and increase the performances if we constrain this pipeline:
 *
 * 1) we track all the Transients until `.release()` is called
 * 2) when activity is detected on one of them, we add it to a "MayHaveChanged" list, and we stop tracking it.
 * 3) later, when we want to detect changes, instead of iterating on all the Transients, we iterate only on the "MayHaveChanged" Transients:
 *   - for each of these "MayHaveChanged" Transients:
 *     - we remove it from this list (because we will know if it changed or not)
 *     - we track again its activity
 *     - we check if it changed:
 *       - if true, we immediately stop and return `true`,
 *       - else we continue the iteration, and at the end of it we return `false`, if none of the list changed.
 * 4) if change have been detected, we may continue with 2, or we may call `.release()` to stop all of this process (jumping to 1), if we want to track again).
 */
export class OptimizedAggregateTransient implements AggregateTransientTrait {
  readonly #list: readonly Transient[];

  #transientSnapshotChangedFunctions!: readonly TransientSnapshotChanged[];
  #untrackTransientActivityFunctions!: UndoFunction[];
  readonly #transientIndexesThatMayHaveChanged: number[] = [];

  #activityListenerId: number = 0;
  #currentActivityListener: TransientActivity | undefined;
  #snapshotTaken: boolean = false;
  #activityTracked: boolean = false;
  #changedAllowed: boolean = false;

  constructor(list: readonly Transient[]) {
    this.#list = list;
    this.#transientIndexesThatMayHaveChanged = [];
    this.#activityListenerId = 0;
    this.#snapshotTaken = false;
    this.#activityTracked = false;
    this.#changedAllowed = false;
  }

  #trackTransientActivityOnce(index: number): void {
    this.#untrackTransientActivityFunctions[index] = this.#list[index].trackActivity((): void => {
      this.#onActivity(index);
    });
  }

  #untrackTransientActivity(index: number): void {
    this.#untrackTransientActivityFunctions[index]();
    this.#untrackTransientActivityFunctions[index] = noop;
  }

  #onActivity(index: number): void {
    this.#transientIndexesThatMayHaveChanged.push(index);
    this.#untrackTransientActivity(index);
    if (this.#currentActivityListener !== undefined) {
      const _currentActivityListener: TransientActivity = this.#currentActivityListener;
      this.#currentActivityListener = undefined;
      this.#changedAllowed = true;
      _currentActivityListener();
    }
  }

  #trackAllTransientActivities(): void {
    if (!this.#activityTracked) {
      this.#activityTracked = true;
      for (let i: number = 0; i < this.#list.length; i++) {
        this.#trackTransientActivityOnce(i);
      }
    }
  }

  #untrackAllTransientActivities(): void {
    if (this.#activityTracked) {
      this.#activityTracked = false;
      this.#currentActivityListener = undefined;
      for (let i: number = 0; i < this.#list.length; i++) {
        this.#untrackTransientActivity(i);
      }
    }
  }

  #snapshotChanged(): boolean {
    if (this.#activityTracked) {
      if (this.#changedAllowed) {
        this.#changedAllowed = false;
        while (this.#transientIndexesThatMayHaveChanged.length > 0) {
          const index: number = this.#transientIndexesThatMayHaveChanged.pop()!;
          this.#trackTransientActivityOnce(index);
          if (this.#transientSnapshotChangedFunctions[index]()) {
            return true;
          }
        }
        return false;
      } else {
        throw new Error(
          '`changed` already called, or `changed` called before activity has been detected.',
        );
      }
    } else {
      for (let i: number = 0; i < this.#transientSnapshotChangedFunctions.length; i++) {
        if (this.#transientSnapshotChangedFunctions[i]()) {
          return true;
        }
      }
      return false;
    }
  }

  takeSnapshot(): TransientSnapshotChanged {
    if (this.#snapshotTaken) {
      throw new Error('Only one snapshot may be taken.');
    } else {
      this.#snapshotTaken = true;
      // take a snapshot of each transient
      this.#transientSnapshotChangedFunctions = this.#list.map(
        (transient: Transient): TransientSnapshotChanged => {
          return transient.takeSnapshot();
        },
      );
      // prepare the tracking of the transients' activities.
      this.#untrackTransientActivityFunctions = new Array<UndoFunction>(this.#list.length);

      // return the "changed" function
      return (): boolean => {
        return this.#snapshotChanged();
      };
    }
  }

  trackActivity(onActivity: TransientActivity): UndoFunction {
    if (!this.#snapshotTaken) {
      throw new Error('Snapshot must occur first.');
    }

    if (this.#currentActivityListener === undefined) {
      // track the activity of each transient if not tracked yet
      this.#trackAllTransientActivities();

      // create an uniq id for this listener
      const currentActivityListenerId: number = ++this.#activityListenerId;

      // set the current activity listener
      this.#currentActivityListener = onActivity;

      return (): void => {
        if (
          // undo only if we perform this action on the current activity listener
          this.#activityListenerId === currentActivityListenerId &&
          // and it has not already been done
          this.#currentActivityListener !== undefined
        ) {
          // remove the  current activity listener
          this.#currentActivityListener = undefined;
        }
      };
    } else {
      throw new Error('Activity listener already set.');
    }
  }

  release(): void {
    this.#untrackAllTransientActivities();
  }

  [Symbol.dispose](): void {
    this.#untrackAllTransientActivities();
  }
}
