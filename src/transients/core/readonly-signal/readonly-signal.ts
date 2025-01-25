import { type UndoFunction } from '@xstd/undo-function';
import { type SignalTrait } from '../signal/traits/signal.trait.js';
import { type TransientActivity } from '../transient/traits/types/transient-activity.js';
import { type TransientSnapshotChanged } from '../transient/traits/types/transient-snapshot-changed.js';

export class ReadonlySignal<GValue> implements SignalTrait<GValue> {
  readonly #signal: SignalTrait<GValue>;

  constructor(signal: SignalTrait<GValue>) {
    this.#signal = signal;
  }

  takeSnapshot(): TransientSnapshotChanged {
    return this.#signal.takeSnapshot();
  }

  trackActivity(onActivity: TransientActivity): UndoFunction {
    return this.#signal.trackActivity(onActivity);
  }

  capture(): void {
    return this.#signal.capture();
  }

  get(): GValue {
    return this.#signal.get();
  }
}
