import { type UndoFunction } from '@xstd/undo-function';
import { SignalError } from '../../../signal-error/signal-error.js';
import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { ComputedSignal } from '../../core/computed-signal/computed-signal.js';
import { type ComputedSignalOptions } from '../../core/computed-signal/traits/types/computed-signal-options.js';
import { ReadonlySignal } from '../../core/readonly-signal/readonly-signal.js';
import { type SignalTrait } from '../../core/signal/traits/signal.trait.js';
import { type TransientActivity } from '../../core/transient/traits/types/transient-activity.js';
import { type TransientSnapshotChanged } from '../../core/transient/traits/types/transient-snapshot-changed.js';
import { Transient } from '../../core/transient/transient.js';
import { type SignalUpdateFunctionCallback } from '../../core/writable-signal/traits/types/signal-update-function-callback.js';
import { WritableSignal } from '../../core/writable-signal/writable-signal.js';
import { SignalLinkedError } from './errors/signal-linked-error.js';
import { SignalLockedError } from './errors/signal-locked-error.js';
import { type LinkableSignalTrait } from './traits/linkable-signal.trait.js';
import { type LinkableSignalLinkOptions } from './traits/methods/linkable-signal.link.trait.js';

// https://github.com/angular/angular/pull/58189/files#diff-16f850f5f33730f7b3574e2137ab8750f5f90be010f6d2899b7b7de0a4d11648

export class LinkableSignal<GValue> extends Transient implements LinkableSignalTrait<GValue> {
  static unset<GValue>(options?: ComputedSignalOptions<GValue>): LinkableSignal<GValue> {
    return new LinkableSignal<GValue>(SignalError.UNSET, options);
  }

  static thrown<GValue>(
    error: unknown,
    options?: ComputedSignalOptions<GValue>,
  ): LinkableSignal<GValue> {
    return new LinkableSignal<GValue>(new SignalError(error), options);
  }

  readonly #defaultSignal: WritableSignal<GValue>;
  readonly #linkedWith: WritableSignal<SignalTrait<GValue>>;
  readonly #computedSignal: ComputedSignal<GValue>;

  #linked: boolean;
  #locked: boolean;

  constructor(initialValue: SignalValueOrError<GValue>, options?: ComputedSignalOptions<GValue>) {
    super();

    this.#defaultSignal = new WritableSignal<GValue>(initialValue, options);
    this.#linkedWith = new WritableSignal<SignalTrait<GValue>>(this.#defaultSignal);
    this.#computedSignal = ComputedSignal.unroll<GValue>(this.#linkedWith, options);

    this.#linked = false;
    this.#locked = false;
  }

  #throwIfLinked(): void {
    if (this.#linked) {
      throw new SignalLinkedError({
        message: 'Signal already linked.',
      });
    }
  }

  #throwIfLocked(): void {
    if (this.#locked) {
      throw new SignalLockedError({
        message: 'Signal locked.',
      });
    }
  }

  /**
   * @see TransientTakeSnapshotTrait
   */
  override takeSnapshot(): TransientSnapshotChanged {
    return this.#computedSignal.takeSnapshot();
  }

  /**
   * @see TransientTrackActivityTrait
   */
  override trackActivity(onActivity: TransientActivity): UndoFunction {
    return this.#computedSignal.trackActivity(onActivity);
  }

  /**
   * @see SignalGetTrait
   */
  get(): GValue {
    return this.#computedSignal.get();
  }

  /**
   * @see WritableSignalSetTrait
   */
  set(value: SignalValueOrError<GValue>): void {
    this.#throwIfLinked();
    this.#defaultSignal.set(value);
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

  /**
   * @see LinkableSignalLinkedTrait
   */
  get linked(): boolean {
    return this.#linked;
  }

  /**
   * @see LinkableSignalLockedTrait
   */
  get locked(): boolean {
    return this.#locked;
  }

  /**
   * @see LinkableSignalLinkTrait
   */
  link(
    signal: SignalTrait<GValue>,
    { lock = false }: LinkableSignalLinkOptions = {},
  ): UndoFunction {
    this.#throwIfLinked();

    this.#linkedWith.set(signal);
    this.#linked = true;
    this.#locked = lock;

    let active: boolean = true;

    return (): void => {
      if (active) {
        active = false;
        this.#unlink();
      }
    };
  }

  #unlink(): void {
    this.#linked = false;
    this.#locked = false;
    Transient.runOutsideContext((): void => {
      let value: SignalValueOrError<GValue>;
      try {
        value = this.#computedSignal.get();
      } catch (error: unknown) {
        value = new SignalError(error);
      }
      this.#defaultSignal.set(value);
    });
    this.#linkedWith.set(this.#defaultSignal);
  }

  /**
   * @see LinkableSignalUnlinkTrait
   */
  unlink(): void {
    this.#throwIfLocked();
    this.#unlink();
  }
}
