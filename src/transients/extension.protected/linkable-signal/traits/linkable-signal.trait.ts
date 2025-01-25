import { type SignalTrait } from '../../../core/signal/traits/signal.trait.js';
import { type LinkableSignalLinkTrait } from './methods/linkable-signal.link.trait.js';
import { type LinkableSignalLinkedTrait } from './methods/linkable-signal.linked.trait.js';
import { type LinkableSignalLockedTrait } from './methods/linkable-signal.locked.trait.js';
import { type LinkableSignalUnlinkTrait } from './methods/linkable-signal.unlink.trait.js';

export interface LinkableSignalTrait<GValue>
  extends SignalTrait<GValue>,
    LinkableSignalLinkedTrait,
    LinkableSignalLockedTrait,
    LinkableSignalLinkTrait<GValue>,
    LinkableSignalUnlinkTrait {}
