import { noop } from '@xstd/noop';
import { type UndoFunction } from '@xstd/undo-function';
import { resolveSignalValueOrError } from '../../../signal-value-or-error/resolve-signal-value-or-error.js';
import { type SignalValueOrError } from '../../../signal-value-or-error/signal-value-or-error.js';
import { type SignalTrait } from '../../core/signal/traits/signal.trait.js';
import { type TransientActivity } from '../../core/transient/traits/types/transient-activity.js';
import { type TransientSnapshotChanged } from '../../core/transient/traits/types/transient-snapshot-changed.js';
import { Transient } from '../../core/transient/transient.js';

export class ConstSignal<GValue> extends Transient implements SignalTrait<GValue> {
  readonly #value: SignalValueOrError<GValue>;

  constructor(value: SignalValueOrError<GValue>) {
    super();
    this.#value = value;
  }

  takeSnapshot(): TransientSnapshotChanged {
    return (): boolean => {
      return false;
    };
  }

  trackActivity(_onActivity: TransientActivity): UndoFunction {
    return noop;
  }

  get(): GValue {
    super.capture(); // INFO: not necessary
    return resolveSignalValueOrError<GValue>(this.#value);
  }
}
