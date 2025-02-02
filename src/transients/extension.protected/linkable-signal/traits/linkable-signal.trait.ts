import { type WritableSignalTrait } from '../../../core/writable-signal/traits/writable-signal.trait.js';
import { type LinkableSignalLinkTrait } from './methods/linkable-signal.link.trait.js';
import { type LinkableSignalLinkedTrait } from './methods/linkable-signal.linked.trait.js';
import { type LinkableSignalLockedTrait } from './methods/linkable-signal.locked.trait.js';
import { type LinkableSignalUnlinkTrait } from './methods/linkable-signal.unlink.trait.js';

/**
 * A `WritableSignal` whose state may be linked with another `Signal`.
 */
export interface LinkableSignalTrait<GValue>
  extends WritableSignalTrait<GValue>,
    LinkableSignalLinkedTrait,
    LinkableSignalLockedTrait,
    LinkableSignalLinkTrait<GValue>,
    LinkableSignalUnlinkTrait {}
