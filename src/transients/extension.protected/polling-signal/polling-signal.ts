import { EventDispatcher } from '@xstd/event-emitter';
import { type UndoFunction } from '@xstd/undo-function';
import { SignalError } from '../../../signal-error/signal-error.js';
import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { Signal } from '../../core/signal/signal.js';
import { type SetSignalValue } from '../../core/signal/traits/types/set-signal-value.js';
import { type UpdateSignalValue } from '../../core/signal/traits/types/update-signal-value.js';
import { type TransientActivity } from '../../core/transient/traits/types/transient-activity.js';
import { Transient } from '../../core/transient/transient.js';
import { type PollingSignalTrait } from './traits/polling-signal.trait.js';
import { type PollingSignalOnTrigger } from './traits/types/polling-signal-on-trigger.js';
import { type PollingSignalOptions } from './traits/types/polling-signal-options.js';
import { type PollingSignalReadFunction } from './traits/types/polling-signal-read-function.js';
import { type PollingSignalTrigger } from './traits/types/polling-signal-trigger.js';

export class PollingSignal<GValue>
  extends Signal<GValue>
  implements PollingSignalTrait<GValue>, Disposable
{
  static readonly #triggerDispatcher: EventDispatcher<void> = new EventDispatcher<void>();

  static trigger(): void {
    this.#triggerDispatcher.dispatch();
  }

  static initIdleTrigger(): UndoFunction {
    const loop = () => {
      this.trigger();
      handle = requestIdleCallback(loop);
    };

    let handle: number | undefined = requestIdleCallback(loop);

    return (): void => {
      if (handle !== undefined) {
        cancelIdleCallback(handle);
        handle = undefined;
      }
    };
  }

  readonly #read: PollingSignalReadFunction<GValue>;
  readonly #trigger: PollingSignalTrigger;
  readonly #set: SetSignalValue<GValue>;
  readonly #tracker: EventDispatcher<void>;
  #unsubscribe: UndoFunction | undefined;

  constructor(read: PollingSignalReadFunction<GValue>, options?: PollingSignalOptions<GValue>) {
    let _set!: SetSignalValue<GValue>;
    super(
      read(),
      (set: SetSignalValue<GValue>): UpdateSignalValue => {
        _set = set;
        return (): void => {
          this.#updateValue();
        };
      },
      options,
    );
    this.#read = read;
    this.#set = _set;
    this.#tracker = new EventDispatcher<void>();

    this.#trigger =
      options?.trigger ??
      ((onTrigger: PollingSignalOnTrigger): UndoFunction => {
        return PollingSignal.#triggerDispatcher.emitter.listen(onTrigger);
      });

    this.activate(true);
  }

  /**
   * @see TransientTrackActivityTrait
   */
  override trackActivity(onActivity: TransientActivity): UndoFunction {
    return this.#tracker.emitter.listen(onActivity);
  }

  /**
   * @see PollingSignalActiveTrait
   */
  get active(): boolean {
    return this.#unsubscribe !== undefined;
  }

  #updateValue(): void {
    let value: SignalValueOrError<GValue>;

    try {
      value = Transient.runOutsideContext((): GValue => this.#read());
    } catch (error: unknown) {
      value = new SignalError(error);
    }

    if (this.#set(value)) {
      this.#tracker.dispatch();
    }
  }

  /**
   * @see SignalFromObservableActivateTrait
   */
  activate(active?: boolean): void {
    if (active !== this.active) {
      if (active) {
        this.#unsubscribe = this.#trigger((): void => {
          this.#updateValue();
        });
      } else {
        this.#unsubscribe!();
        this.#unsubscribe = undefined;
      }
    }
  }

  [Symbol.dispose](): void {
    this.activate(false);
  }
}
