import { type UndoFunction } from '@xstd/undo-function';
import { SignalWatcher } from '../../watchers/signal-watcher/signal-watcher.js';
import { type SignalWatcherFunction } from '../../watchers/signal-watcher/traits/types/signal-watcher-function.js';
import { type SignalWatcherOnErrorFunction } from '../../watchers/signal-watcher/traits/types/signal-watcher-on-error-function.js';
import { type SignalWatcherOnValueFunction } from '../../watchers/signal-watcher/traits/types/signal-watcher-on-value-function.js';
import { signalOrSignalFncToSignal } from '../signal-or/signal-or-signal-fnc/signal-or-signal-fnc-to-signal.js';
import { type SignalOrSignalFnc } from '../signal-or/signal-or-signal-fnc/signal-or-signal-fnc.js';
import { type SignalWatcherFncConstructor } from './types/writable-signal-fnc-constructor.js';

export const watch: SignalWatcherFncConstructor = (<GValue>(
  signal: SignalOrSignalFnc<GValue>,
  signalWatcherFunction: SignalWatcherFunction<GValue>,
): UndoFunction => {
  const watcher = new SignalWatcher<GValue>(
    signalOrSignalFncToSignal<GValue>(signal),
    signalWatcherFunction,
  );
  return (): void => {
    return watcher.stop();
  };
}) as SignalWatcherFncConstructor;

watch.value = <GValue>(
  signal: SignalOrSignalFnc<GValue>,
  onValue: SignalWatcherOnValueFunction<GValue>,
  onError?: SignalWatcherOnErrorFunction,
): UndoFunction => {
  const watcher = SignalWatcher.watch<GValue>(
    signalOrSignalFncToSignal<GValue>(signal),
    onValue,
    onError,
  );
  return (): void => {
    return watcher.stop();
  };
};
