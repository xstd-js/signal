import { SIGNAL } from './signal.symbol.ts';

export interface Signal<GValue> {
  (): GValue;

  [SIGNAL]: unknown;
}
