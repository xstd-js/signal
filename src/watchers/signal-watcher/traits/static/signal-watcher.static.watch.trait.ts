import { type SignalTrait } from '../../../../transients/core/signal/traits/signal.trait.js';
import { type SignalWatcherTrait } from '../signal-watcher.trait.js';
import { type SignalWatcherOnErrorFunction } from '../types/signal-watcher-on-error-function.js';
import { type SignalWatcherOnValueFunction } from '../types/signal-watcher-on-value-function.js';

/**
 * Watches a `Signal`'s value.
 */
export interface SignalWatcherStaticWatchTrait {
  watch<GValue>(
    signal: SignalTrait<GValue>,
    onValue: SignalWatcherOnValueFunction<GValue>,
    onError?: SignalWatcherOnErrorFunction,
  ): SignalWatcherTrait;
}
