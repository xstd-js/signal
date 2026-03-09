import { type EffectStopTrait } from './methods/effect.stop.trait.js';

export interface EffectTrait extends EffectStopTrait, Disposable {}
