import { type EffectTrait } from './effect.trait.js';
import { type EffetFunction } from './types/effet-function.js';

export interface EffectConstructor {
  new (effectFunction: EffetFunction): EffectTrait;
}
