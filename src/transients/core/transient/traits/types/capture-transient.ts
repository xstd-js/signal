import { type Transient } from '../../transient.js';

/**
 * A function called when a `Transient` is captured from the context of a callback.
 */
export interface CaptureTransient {
  (transient: Transient): void;
}
