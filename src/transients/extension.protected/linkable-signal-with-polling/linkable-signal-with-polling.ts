import { EQUAL_FUNCTION_STRICT_EQUAL, type EqualFunction } from '@xstd/equal-function';
import { type UndoFunction } from '@xstd/undo-function';
import { SignalError } from '../../../signal-error/signal-error.js';
import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { LinkableSignal } from '../linkable-signal/linkable-signal.js';
import { type LinkableSignalLinkOptions } from '../linkable-signal/traits/methods/linkable-signal.link.trait.js';
import { type LinkableSignalOptions } from '../linkable-signal/traits/types/linkable-signal-options.js';
import { PollingSignal } from '../polling-signal/polling-signal.js';
import { type PollingSignalOptions } from '../polling-signal/traits/types/polling-signal-options.js';
import { type PollingSignalReadFunction } from '../polling-signal/traits/types/polling-signal-read-function.js';

export interface LinkableSignalWithPollingOptions<GValue> extends LinkableSignalOptions<GValue> {}

export interface LinkableSignalWithPollingStartPollingOptions
  extends LinkableSignalLinkOptions,
    Omit<PollingSignalOptions<any>, keyof LinkableSignalWithPollingOptions<any>> {}

export class LinkableSignalWithPolling<GValue> extends LinkableSignal<GValue> {
  static unset<GValue>(options?: LinkableSignalOptions<GValue>): LinkableSignal<GValue> {
    throw new Error('LinkableSignalWithPolling.unset forbidden.');
  }

  static thrown<GValue>(
    error: unknown,
    options?: LinkableSignalOptions<GValue>,
  ): LinkableSignal<GValue> {
    throw new Error('LinkableSignalWithPolling.thrown forbidden.');
  }

  readonly #poll: PollingSignalReadFunction<GValue>;
  readonly #equal: EqualFunction<GValue>;

  constructor(
    poll: PollingSignalReadFunction<GValue>,
    options?: LinkableSignalWithPollingOptions<GValue>,
  ) {
    let initialValue: SignalValueOrError<GValue>;
    try {
      initialValue = poll();
    } catch (error: unknown) {
      initialValue = new SignalError(error);
    }
    super(initialValue, options);
    this.#poll = poll;
    this.#equal = options?.equal ?? EQUAL_FUNCTION_STRICT_EQUAL;
  }

  startPolling(options?: LinkableSignalWithPollingStartPollingOptions): UndoFunction {
    return this.link(
      new PollingSignal<GValue>(this.#poll, {
        ...options,
        equal: this.#equal,
      }),
      options,
    );
  }
}
