import { EventDispatcher } from '@xstd/event-emitter';
import { type UndoFunction } from '@xstd/undo-function';
import { SignalError } from '../../../signal-error/signal-error.js';
import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { ReadonlySignal } from '../readonly-signal/readonly-signal.js';
import { Signal } from '../signal/signal.js';
import { type SetSignalValue } from '../signal/traits/types/set-signal-value.js';
import { type SignalOptions } from '../signal/traits/types/signal-options.js';
import { type TransientActivity } from '../transient/traits/types/transient-activity.js';
import { Transient } from '../transient/transient.js';
import { type SignalUpdateFunctionCallback } from './traits/types/signal-update-function-callback.js';
import { type WritableSignalTrait } from './traits/writable-signal.trait.js';

/**
 * @see WritableSignalTrait
 */
export class WritableSignal<GValue> extends Signal<GValue> implements WritableSignalTrait<GValue> {
  static unset<GValue>(options?: SignalOptions<GValue>): WritableSignal<GValue> {
    return new WritableSignal<GValue>(SignalError.UNSET, options);
  }

  static thrown<GValue>(error: unknown, options?: SignalOptions<GValue>): WritableSignal<GValue> {
    return new WritableSignal<GValue>(new SignalError(error), options);
  }

  readonly #set: SetSignalValue<GValue>;
  readonly #tracker: EventDispatcher<void>;

  constructor(initialValue: SignalValueOrError<GValue>, options?: SignalOptions<GValue>) {
    let _set!: SetSignalValue<GValue>;
    super(
      initialValue,
      (set: SetSignalValue<GValue>): void => {
        _set = set;
      },
      options,
    );
    this.#set = _set;
    this.#tracker = new EventDispatcher<void>();
  }

  /**
   * @see TransientTrackActivityTrait
   */
  override trackActivity(onActivity: TransientActivity): UndoFunction {
    return this.#tracker.emitter.listen(onActivity);
  }

  /**
   * @see WritableSignalSetTrait
   */
  set(value: SignalValueOrError<GValue>): void {
    if (Transient.isInContext()) {
      throw new Error('The signal cannot be written is this context.');
    }
    if (this.#set(value)) {
      this.#tracker.dispatch();
    }
  }

  /**
   * @see WritableSignalThrowTrait
   */
  throw(error: unknown): void {
    this.set(new SignalError(error));
  }

  /**
   * @see WritableSignalUpdateTrait
   */
  update(updateFunction: SignalUpdateFunctionCallback<GValue>): void {
    const currentValue: GValue = this.get();
    let value: GValue | SignalError;

    try {
      value = updateFunction(currentValue);
    } catch (error: unknown) {
      value = new SignalError(error);
    }

    this.set(value);
  }

  /**
   * @see WritableSignalAsReadonlyTrait
   */
  asReadonly(): ReadonlySignal<GValue> {
    return new ReadonlySignal<GValue>(this);
  }
}
