import { type UndoFunction } from '@xstd/undo-function';
import { type TransientTrait } from './traits/transient.trait.js';
import { type CaptureTransient } from './traits/types/capture-transient.js';
import { type TransientActivity } from './traits/types/transient-activity.js';
import { type TransientSnapshotChanged } from './traits/types/transient-snapshot-changed.js';

/**
 * @see TransientTrait
 */
export abstract class Transient implements TransientTrait {
  static #currentContext: CaptureTransient | undefined;

  /**
   * Runs a `callback` in witch any `Transient` captured synchronously through `transient.capture()` is provided to the function `captureTransient`.
   */
  static runInContext<GReturn>(
    captureTransient: CaptureTransient | undefined,
    callback: () => GReturn,
  ): GReturn {
    const previousContext: CaptureTransient | undefined = this.#currentContext;
    this.#currentContext = captureTransient;
    try {
      return callback();
    } finally {
      this.#currentContext = previousContext;
    }
  }

  /**
   * Ignores any `transient.capture()` present in the context of `callback`.
   */
  static runOutsideContext<GReturn>(callback: () => GReturn): GReturn {
    return this.runInContext<GReturn>(undefined, callback);
  }

  /**
   * Returns `true` if we are currently inside a "Transient context".
   */
  static isInContext(): boolean {
    return this.#currentContext !== undefined;
  }

  /**
   * @see TransientTakeSnapshotTrait
   */
  abstract takeSnapshot(): TransientSnapshotChanged;

  /**
   * @see TransientTrackActivityTrait
   */
  abstract trackActivity(onActivity: TransientActivity): UndoFunction;

  /**
   * @see TransientCaptureTrait
   */
  capture(): void {
    if (Transient.#currentContext !== undefined) {
      Transient.#currentContext(this);
    }
  }
}
