import { type UndoFunction } from '@xstd/undo-function';
import { type PollingSignalOnTrigger } from './polling-signal-on-trigger.js';

export interface PollingSignalTrigger {
  (onTrigger: PollingSignalOnTrigger): UndoFunction;
}
