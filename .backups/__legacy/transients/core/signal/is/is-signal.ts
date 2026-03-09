import { isTransient } from '../../transient/is/is-transient.js';
import { type SignalTrait } from '../traits/signal.trait.js';

export function isSignal<GValue>(input: unknown): input is SignalTrait<GValue> {
  return isTransient(input) && typeof (input as any)['get'] === 'function';
}
