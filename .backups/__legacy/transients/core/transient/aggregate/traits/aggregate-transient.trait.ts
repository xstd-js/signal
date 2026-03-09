import { type TransientTakeSnapshotTrait } from '../../traits/methods/transient.take-snapshot.trait.js';
import { type TransientTrackActivityTrait } from '../../traits/methods/transient.track-activity.trait.js';

export interface AggregateTransientTrait
  extends TransientTakeSnapshotTrait,
    TransientTrackActivityTrait {}
