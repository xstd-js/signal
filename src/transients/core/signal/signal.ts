import { EQUAL_FUNCTION_STRICT_EQUAL, type EqualFunction } from '@xstd/equal-function';
import { noop } from '@xstd/noop';
import { SignalError } from '../../../signal-error/signal-error.js';
import { areSignalValueOrErrorDifferent } from '../../../signal-value-or-error/are-signal-value-or-error-different.js';
import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { type TransientSnapshotChanged } from '../transient/traits/types/transient-snapshot-changed.js';
import { Transient } from '../transient/transient.js';
import { type SignalTrait } from './traits/signal.trait.js';
import { type SetupSignalValue } from './traits/types/setup-signal-value.js';
import { type SignalOptions } from './traits/types/signal-options.js';
import { type UpdateSignalValue } from './traits/types/update-signal-value.js';

/**
 * @see SignalTrait
 */
export abstract class Signal<GValue> extends Transient implements SignalTrait<GValue> {
  #value: SignalValueOrError<GValue>;
  readonly #equal: EqualFunction<GValue>;
  readonly #updateValue: UpdateSignalValue;

  constructor(
    initialValue: SignalValueOrError<GValue>,
    setupSignalValue: SetupSignalValue<GValue>,
    { equal = EQUAL_FUNCTION_STRICT_EQUAL }: SignalOptions<GValue> = {},
  ) {
    super();

    this.#value = initialValue;
    this.#equal = equal;

    this.#updateValue =
      setupSignalValue((value: SignalValueOrError<GValue>): boolean => {
        return this.#set(value);
      }) ?? noop;
  }

  #set(value: SignalValueOrError<GValue>): boolean {
    const changed: boolean = this.#isDifferentValue(value);
    this.#value = value;
    return changed;
  }

  #isDifferentValue(value: SignalValueOrError<GValue>): boolean {
    return areSignalValueOrErrorDifferent<GValue>(value, this.#value, this.#equal);
  }

  /**
   * @see TransientTakeSnapshotTrait
   */
  override takeSnapshot(): TransientSnapshotChanged {
    this.#updateValue();
    const value: SignalValueOrError<GValue> = this.#value;
    return (): boolean => {
      this.#updateValue();
      return this.#isDifferentValue(value);
    };
  }

  /**
   * @see TransientCaptureTrait
   */
  override capture(): void {
    throw new Error('Use ".get()" instead of ".capture()".');
  }

  /**
   * @see SignalGetTrait
   */
  get(): GValue {
    super.capture();
    this.#updateValue();
    if (this.#value instanceof SignalError) {
      throw this.#value.error;
    }
    return this.#value;
  }
}
