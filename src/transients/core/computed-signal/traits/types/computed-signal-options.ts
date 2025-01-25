import { type SignalOptions } from '../../../signal/traits/types/signal-options.js';

export interface ComputedSignalOptions<GValue> extends SignalOptions<GValue> {
  readonly untrackDelay?: number;
}
