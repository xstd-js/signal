import { type TransientTrait } from '../traits/transient.trait.js';

export function isTransient(input: unknown): input is TransientTrait {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as any)['takeSnapshot'] === 'function' &&
    typeof (input as any)['trackActivity'] === 'function' &&
    typeof (input as any)['capture'] === 'function'
  );
}
