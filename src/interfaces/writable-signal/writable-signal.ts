import type { Signal } from '../signal/signal.ts';

export interface WritableSignal<GValue> extends Signal<GValue> {
  set(value: GValue): void;
  asReadonly(): Signal<GValue>;
}
