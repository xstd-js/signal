import { type SignalValueOrError } from '../../../../signal-value-or-error/signal-value-or-error.js';
import { type SignalWatcherCleanUpFunction } from './signal-watcher-clean-up-function.js';

export interface SignalWatcherFunction<GValue> {
  (value: SignalValueOrError<GValue>): SignalWatcherCleanUpFunction | void;
}
