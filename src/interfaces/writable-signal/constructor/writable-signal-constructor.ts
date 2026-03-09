import type { SignalOptions } from '../../signal/constructor/signal-options.ts';
import type { WritableSignal } from '../writable-signal.ts';

export interface WritableSignalConstructor {
  <GValue>(initialValue: GValue, options?: SignalOptions<GValue>): WritableSignal<GValue>;
}
