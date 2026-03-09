import type { SignalOptions } from '../../signal/constructor/signal-options.ts';
import type { ComputedSignal } from '../computed-signal.ts';

export interface RunComputed<GValue> {
  (): GValue;
}

export interface ComputedSignalConstructor {
  <GValue>(fn: RunComputed<GValue>, options?: SignalOptions<GValue>): ComputedSignal<GValue>;
}
