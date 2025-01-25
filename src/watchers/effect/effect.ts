import { type UndoFunction } from '@xstd/undo-function';
import { OptimizedAggregateTransient } from '../../transients/core/transient/aggregate/optimized/optimized-aggregate-transient.js';
import { type TransientSnapshotChanged } from '../../transients/core/transient/traits/types/transient-snapshot-changed.js';
import { Transient } from '../../transients/core/transient/transient.js';
import { type EffectTrait } from './traits/effect.trait.js';
import { type EffetFunction } from './traits/types/effet-function.js';

export class Effect implements EffectTrait {
  readonly #effectFunction: EffetFunction;

  #cleanUp: UndoFunction | undefined | void;
  #aggregateTransient: OptimizedAggregateTransient | undefined;
  #snapshotChanged: TransientSnapshotChanged | undefined;
  #untrackActivity: UndoFunction | undefined;

  constructor(effectFunction: EffetFunction) {
    if (Transient.isInContext()) {
      throw new Error('Cannot create an effect in this context.');
    }
    this.#effectFunction = effectFunction;
    this.#update();
  }

  /**
   * Releases any `aggregateTransient`.
   */
  #releaseAggregateTransient(): void {
    if (this.#aggregateTransient !== undefined) {
      this.#aggregateTransient.release();
      this.#aggregateTransient = undefined;
    }
  }

  /**
   * Calls any previous watcher's cleanup function.
   */
  #doCleanUp(): void {
    if (this.#cleanUp !== undefined) {
      this.#cleanUp();
      this.#cleanUp = undefined;
    }
  }

  /**
   * Untracks any previously tracked activity.
   */
  #doUntrackActivity(): void {
    if (this.#untrackActivity !== undefined) {
      this.#untrackActivity();
      this.#untrackActivity = undefined;
    }
  }

  #update(): void {
    // cleanup the previous effect context
    this.#doCleanUp();

    // releases any previous `aggregateTransient`
    this.#releaseAggregateTransient();

    // runs the effect function and captures the used transients
    const list: Transient[] = [];
    this.#cleanUp = Transient.runInContext<UndoFunction | void>((reactive: Transient): void => {
      list.push(reactive);
    }, this.#effectFunction);

    // creates a transient aggregator
    this.#aggregateTransient = new OptimizedAggregateTransient(list);

    // takes a snapshot
    this.#snapshotChanged = this.#aggregateTransient.takeSnapshot();

    // loops until we detect changes
    this.#untilChanged();
  }

  #untilChanged(): void {
    this.#untrackActivity = this.#aggregateTransient!.trackActivity((): void => {
      this.#doUntrackActivity();

      // postpones the change detection until no more "sync" script is running
      queueMicrotask((): void => {
        if (this.#aggregateTransient !== undefined) {
          if (this.#snapshotChanged!()) {
            this.#update();
          } else {
            this.#untilChanged();
          }
        }
      });
    });
  }

  stop(): void {
    if (this.#aggregateTransient !== undefined) {
      this.#releaseAggregateTransient();
      this.#doUntrackActivity();
      this.#doCleanUp();
    }
  }

  [Symbol.dispose](): void {
    this.stop();
  }
}
