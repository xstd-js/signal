import { type SignalOptions } from '../../../../core/signal/traits/types/signal-options.js';

export interface SignalFromObservableSharedOptions<GValue> extends SignalOptions<GValue> {
  readonly initialValue?: GValue;
}

export interface SignalFromValueObservableOptions<GValue>
  extends SignalFromObservableSharedOptions<GValue> {
  readonly mode?: 'value'; // (default: 'value')
}

export interface SignalFromNotificationsObservableOptions<GValue>
  extends SignalFromObservableSharedOptions<GValue> {
  readonly mode: 'notification';
  readonly unsubscribeOnError?: boolean; // (default: true)
}

export type SignalFromObservableOptions<GValue> =
  | SignalFromValueObservableOptions<GValue>
  | SignalFromNotificationsObservableOptions<GValue>;
