import { type SignalWatcherCleanUpFunction } from './signal-watcher-clean-up-function.js';

export interface SignalWatcherOnValueFunction<GValue> {
  (value: GValue): SignalWatcherCleanUpFunction | void;
}
