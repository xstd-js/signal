import type { Signal } from '../signal/signal.ts';

/**
 * Represents a writable signal: a signal that can be set to a new value.
 */
export interface WritableSignal<GValue> extends Signal<GValue> {
  set(value: GValue): void;
  asReadonly(): Signal<GValue>;
}
