import { type TransientTrait } from './transient.trait.js';

export interface TransientConstructor {
  new (): TransientTrait;
}
