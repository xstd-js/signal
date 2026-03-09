import { type SignalWatcherCleanUpFunction } from './signal-watcher-clean-up-function.js';

export interface SignalWatcherOnErrorFunction {
  (error: unknown): SignalWatcherCleanUpFunction | void;
}
