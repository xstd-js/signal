import { type SignalTrait } from '../../../transients/core/signal/traits/signal.trait.js';
import { type SignalWatcherTrait } from './signal-watcher.trait.js';
import { type SignalWatcherStaticWatchTrait } from './static/signal-watcher.static.watch.trait.js';
import { type SignalWatcherFunction } from './types/signal-watcher-function.js';

export interface SignalWatcherConstructor extends SignalWatcherStaticWatchTrait {
  new <GValue>(
    signal: SignalTrait<GValue>,
    signalWatcherFunction: SignalWatcherFunction<GValue>,
  ): SignalWatcherTrait;
}
