import { type PollingSignalTrait } from './polling-signal.trait.js';
import { type PollingSignalOptions } from './types/polling-signal-options.js';
import { type PollingSignalReadFunction } from './types/polling-signal-read-function.js';

export interface PollingSignalConstructor {
  new <GValue>(
    read: PollingSignalReadFunction<GValue>,
    options?: PollingSignalOptions<GValue>,
  ): PollingSignalTrait<GValue>;
}
