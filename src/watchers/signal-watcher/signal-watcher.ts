import { type UndoFunction } from '@xstd/undo-function';
import { SignalError } from '../../signal-error/signal-error.js';
import { type SignalValueOrError } from '../../signal-value-or-error/signal-value-or-error.js';
import { type SignalTrait } from '../../transients/core/signal/traits/signal.trait.js';
import { type TransientSnapshotChanged } from '../../transients/core/transient/traits/types/transient-snapshot-changed.js';
import { Transient } from '../../transients/core/transient/transient.js';
import { type SignalWatcherTrait } from './traits/signal-watcher.trait.js';
import { type SignalWatcherCleanUpFunction } from './traits/types/signal-watcher-clean-up-function.js';
import { type SignalWatcherFunction } from './traits/types/signal-watcher-function.js';
import { type SignalWatcherOnErrorFunction } from './traits/types/signal-watcher-on-error-function.js';
import { type SignalWatcherOnValueFunction } from './traits/types/signal-watcher-on-value-function.js';

export class SignalWatcher<GValue> implements SignalWatcherTrait {
  static watch<GValue>(
    signal: SignalTrait<GValue>,
    onValue: SignalWatcherOnValueFunction<GValue>,
    onError: SignalWatcherOnErrorFunction = this.LOG_ERROR,
  ): SignalWatcher<GValue> {
    return new SignalWatcher<GValue>(
      signal,
      (value: SignalValueOrError<GValue>): SignalWatcherCleanUpFunction | void => {
        if (value instanceof SignalError) {
          return onError(value.error);
        } else {
          return onValue(value);
        }
      },
    );
  }

  static readonly DISCARD_ERROR: SignalWatcherOnErrorFunction = (): void => {};
  static readonly LOG_ERROR: SignalWatcherOnErrorFunction = (error: unknown): void => {
    console.error(error);
  };

  readonly #signal: SignalTrait<GValue>;
  readonly #signalWatcherFunction: SignalWatcherFunction<GValue>;

  #activityScheduled: boolean;
  #disposed: boolean;
  #cleanUp: UndoFunction | undefined | void;
  #snapshotChanged: TransientSnapshotChanged | undefined;
  #untrackActivity: UndoFunction | undefined;

  constructor(signal: SignalTrait<GValue>, signalWatcherFunction: SignalWatcherFunction<GValue>) {
    if (Transient.isInContext()) {
      throw new Error('Cannot create an signal watcher in this context.');
    }
    this.#signal = signal;
    this.#signalWatcherFunction = signalWatcherFunction;
    this.#activityScheduled = false;
    this.#disposed = false;
    this.#trackActivity();
    this.#update();
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
   * Tracks any signal's activity.
   */
  #trackActivity(): void {
    this.#untrackActivity = this.#signal.trackActivity((): void => {
      if (!this.#activityScheduled) {
        this.#activityScheduled = true;
        // postpones the change detection until no more "sync" script is running
        queueMicrotask((): void => {
          this.#activityScheduled = false;
          if (!this.#disposed) {
            if (this.#snapshotChanged!()) {
              this.#update();
            }
          }
        });
      }
    });
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
    // cleanup the previous watcher context
    this.#doCleanUp();

    // reads the signal's value
    const value: SignalValueOrError<GValue> = Transient.runOutsideContext(
      (): SignalValueOrError<GValue> => {
        try {
          return this.#signal.get();
        } catch (error: unknown) {
          return new SignalError(error);
        }
      },
    );

    // takes a snapshot
    this.#snapshotChanged = this.#signal.takeSnapshot();

    // notifies the watcher
    this.#cleanUp = this.#signalWatcherFunction(value);
  }

  stop(): void {
    if (!this.#disposed) {
      this.#disposed = true;
      this.#doUntrackActivity();
      this.#doCleanUp();
    }
  }

  [Symbol.dispose](): void {
    this.stop();
  }
}
