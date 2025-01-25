import { type UndoFunction } from '@xstd/undo-function';
import { type SignalWatcherFunction } from '../../../watchers/signal-watcher/traits/types/signal-watcher-function.js';
import { type SignalWatcherOnErrorFunction } from '../../../watchers/signal-watcher/traits/types/signal-watcher-on-error-function.js';
import { type SignalWatcherOnValueFunction } from '../../../watchers/signal-watcher/traits/types/signal-watcher-on-value-function.js';
import { type SignalOrSignalFnc } from '../../signal-or/signal-or-signal-fnc/signal-or-signal-fnc.js';

export interface SignalWatcherFncConstructor {
  <GValue>(
    signal: SignalOrSignalFnc<GValue>,
    signalWatcherFunction: SignalWatcherFunction<GValue>,
  ): UndoFunction;

  value<GValue>(
    signal: SignalOrSignalFnc<GValue>,
    onValue: SignalWatcherOnValueFunction<GValue>,
    onError?: SignalWatcherOnErrorFunction,
  ): UndoFunction;
}
