import type { Signal } from '../signal/signal.ts';

/**
 * A signal whose value is computed from other signals.
 */
export interface ComputedSignal<GValue> extends Signal<GValue> {}
