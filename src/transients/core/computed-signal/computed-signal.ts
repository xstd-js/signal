import { EventDispatcher } from '@xstd/event-emitter';
import { type UndoFunction } from '@xstd/undo-function';
import { SignalError } from '../../../signal-error/signal-error.js';
import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { Signal } from '../signal/signal.js';
import { type SignalTrait } from '../signal/traits/signal.trait.js';
import { type SetSignalValue } from '../signal/traits/types/set-signal-value.js';
import { type UpdateSignalValue } from '../signal/traits/types/update-signal-value.js';
import { OptimizedAggregateTransient } from '../transient/aggregate/optimized/optimized-aggregate-transient.js';
import { type TransientActivity } from '../transient/traits/types/transient-activity.js';
import { type TransientSnapshotChanged } from '../transient/traits/types/transient-snapshot-changed.js';
import { Transient } from '../transient/transient.js';
import { type ComputedSignalTrait } from './traits/computed-signal.trait.js';
import { type ComputationFunction } from './traits/types/computation-function.js';
import { type ComputedSignalOptions } from './traits/types/computed-signal-options.js';

/**
 * @see ComputedSignalTrait
 */
export class ComputedSignal<GValue> extends Signal<GValue> implements ComputedSignalTrait<GValue> {
  static defaultUntrackDelay: number = 2_000;

  static unroll<GValue>(
    signal: SignalTrait<SignalTrait<GValue>>,
    options?: ComputedSignalOptions<GValue>,
  ): ComputedSignal<GValue> {
    return new ComputedSignal((): GValue => {
      return signal.get().get();
    }, options);
  }

  readonly #set: SetSignalValue<GValue>;
  readonly #tracker: EventDispatcher<void>;
  #watchersCount: number;

  #snapshotChanged: TransientSnapshotChanged | undefined;
  #aggregateTransient: OptimizedAggregateTransient | undefined;
  #untrackActivity: UndoFunction | undefined;

  readonly #computation: ComputationFunction<GValue>;
  #computing: boolean;

  #isAsyncComputation: boolean;
  #controller: AbortController | undefined;

  readonly #releaseDelay: number;
  #releaseTimer: any | undefined;

  constructor(computation: ComputationFunction<GValue>, options?: ComputedSignalOptions<GValue>) {
    let _set!: SetSignalValue<GValue>;

    super(
      SignalError.UNSET,
      (set: SetSignalValue<GValue>): UpdateSignalValue => {
        _set = set;
        return (): void => {
          this.#updateValue();
        };
      },
      options,
    );
    this.#set = _set;
    this.#tracker = new EventDispatcher<void>();
    this.#watchersCount = 0;

    this.#computation = computation;
    this.#computing = false;

    this.#isAsyncComputation = false;

    this.#releaseDelay = options?.untrackDelay ?? ComputedSignal.defaultUntrackDelay;
  }

  /**
   * Returns `true` if this `ComputedSignal` is _outdated_:
   *  _activity_ has been detected => we must check `snapshotChanged` on the next `updateValue`.
   */
  get #isOutdated(): boolean {
    return this.#untrackActivity === undefined;
  }

  /**
   * Goes into an _outdated_ state, and dispatches an "activity" event to any watchers.
   */
  #markAsOutdated(): void {
    this.#untrackActivity = undefined;
    this.#tracker.dispatch();
  }

  /**
   * Tracks the activity of all the captured transients.
   *
   * When "activity" is detected, it stops tracking, and goes into an _outdated_ state.
   */
  #trackActivityOnce(): void {
    this.#untrackActivity = this.#aggregateTransient!.trackActivity((): void => {
      this.#untrackActivity!();
      this.#markAsOutdated();
    });
  }

  /**
   * Aborts any scheduled `release()`.
   */
  #abortScheduledReleaseTimer(): void {
    if (this.#releaseTimer !== undefined) {
      clearTimeout(this.#releaseTimer);
      this.#releaseTimer = undefined;
    }
  }

  /**
   * Schedules a `release()` after `releaseDelay` milliseconds.
   */
  #scheduleRelease(): void {
    this.#abortScheduledReleaseTimer();
    if (this.#watchersCount === 0) {
      this.#releaseTimer = setTimeout((): void => {
        this.#release();
      }, this.#releaseDelay);
    }
  }

  /**
   * Releases any `aggregateTransient`.
   */
  #releaseAggregateTransient(): void {
    if (this.#aggregateTransient !== undefined) {
      this.#aggregateTransient.release();
    }
  }

  /**
   * Releases some internal resources of this `ComputedSignal`:
   *
   * - releases all tracked transients
   * - enters into an _outdated_ state
   *
   * This optimizes the memory but de-optimizes the computation.
   */
  #release(): void {
    this.#abortScheduledReleaseTimer();
    this.#releaseAggregateTransient();
    this.#markAsOutdated();
  }

  /**
   * Called when an `UpdateSignalValue` is requested.
   */
  #updateValue(): void {
    // console.log('updateValue');

    // schedules `release()`
    this.#scheduleRelease();

    // if a snapshot exists
    if (this.#snapshotChanged !== undefined) {
      // if this computed signal is outdated
      if (this.#isOutdated) {
        // if the snapshot did not change
        if (!this.#snapshotChanged()) {
          // tracks again, and awaits for the next `updateValue`
          this.#trackActivityOnce();
          return;
        }
      } else {
        // this computed signal is up-to-date
        return;
      }
    }

    // ensures we're not in a computation cycle (creating an infinite loop)
    if (this.#computing) {
      throw new Error('Cycle in computation.');
    }

    // start of computation
    this.#computing = true;

    // creates an AbortController for this context.
    if (this.#isAsyncComputation) {
      // console.assert(this.#controller !== undefined);
      this.#controller!.abort();
      this.#controller = new AbortController();
    } else if (this.#controller === undefined) {
      this.#controller = new AbortController();
    }

    // releases any previous `aggregateTransient`
    this.#releaseAggregateTransient();

    // runs the computation function and captures the used transients
    const list: Transient[] = [];
    let value: SignalValueOrError<Promise<GValue> | GValue>;

    try {
      value = Transient.runInContext<Promise<GValue> | GValue>(
        (reactive: Transient): void => {
          list.push(reactive);
        },
        (): Promise<GValue> | GValue => {
          return this.#computation(this.#controller!.signal);
        },
      );
    } catch (error: unknown) {
      value = new SignalError(error);
    }

    // creates a transient aggregator
    this.#aggregateTransient = new OptimizedAggregateTransient(list);

    // takes a snapshot
    this.#snapshotChanged = this.#aggregateTransient.takeSnapshot();

    // tracks activity
    this.#trackActivityOnce();

    // end of computation
    this.#computing = false;

    // test if it is an async computation
    if (value instanceof Promise) {
      this.#isAsyncComputation = true;

      const signal: AbortSignal = this.#controller!.signal;

      const promise: Promise<SignalValueOrError<GValue>> = value.then(
        (value: GValue): GValue => {
          return value;
        },
        (error: unknown): SignalError => {
          return new SignalError(error);
        },
      );

      value = SignalError.LOADING;

      promise.then((value: SignalValueOrError<GValue>): void => {
        if (!signal.aborted) {
          this.#isAsyncComputation = false;

          // updates the value
          this.#setValue(value);
        }
      });
    } else {
      this.#isAsyncComputation = false;
    }

    // updates the value
    this.#setValue(value);
  }

  #setValue(value: SignalValueOrError<GValue>): void {
    // updates the value
    if (this.#set(value)) {
      // and notifies the watchers in case of changes
      this.#tracker.dispatch();
    }
  }

  /**
   * @see TransientTrackActivityTrait
   */
  override trackActivity(onActivity: TransientActivity): UndoFunction {
    this.#watchersCount++;
    this.#abortScheduledReleaseTimer();
    const undo: UndoFunction = this.#tracker.emitter.listen(onActivity);
    let running: boolean = true;
    return (): void => {
      if (running) {
        running = false;
        undo();
        this.#watchersCount--;
        this.#scheduleRelease();
      }
    };
  }
}
