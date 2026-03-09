import { type SignalOptions } from '../../../../core/signal/traits/types/signal-options.js';
import { type PollingSignalTrigger } from './polling-signal-trigger.js';

export interface PollingSignalOptions<GValue> extends SignalOptions<GValue> {
  readonly trigger?: PollingSignalTrigger;
}
