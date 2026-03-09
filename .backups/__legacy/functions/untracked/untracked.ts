import { Transient } from '../../transients/core/transient/transient.js';

export function untracked<GReturn>(callback: () => GReturn): GReturn {
  return Transient.runOutsideContext<GReturn>(callback);
}
