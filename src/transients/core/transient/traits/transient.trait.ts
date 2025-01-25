import { type TransientCaptureTrait } from './methods/transient.capture.trait.js';
import { type TransientTakeSnapshotTrait } from './methods/transient.take-snapshot.trait.js';
import { type TransientTrackActivityTrait } from './methods/transient.track-activity.trait.js';

/**
 * A `Transient` is an object that **changes** over time.
 *
 * It's build in such a way that we cannot observe directly its state, but we may observe and detect _abstract_ changes that happen to it.
 *
 * [Definition of the word `transient`:](https://www.dictionary.com/browse/transient)
 * > not lasting, enduring, or permanent; transitory
 *
 * It is based on 3 fundamental operations:
 *
 * ### 1) Taking a snapshot of the Transient
 *
 * A _snapshot_ retains the state of the `Transient` at a specific moment.
 * It returns a `TransientSnapshotChanged` function, which may be called to detect if a change happened in the `Transient` since this snapshot was taken.
 *
 * It answers the question: _"Did my transient changed since I took this snapshot ?"_
 *
 * #### Types
 *
 * ```ts
 * interface Transient {
 *  takeSnapshot: TakeTransientSnapshot;
 * }
 *
 * interface TakeTransientSnapshot {
 *   (): TransientSnapshotChanged;
 * }
 *
 * interface TransientSnapshotChanged {
 *   (): boolean;
 * }
 * ```
 *
 * #### Example
 *
 * ```ts
 * const snapshot = transient.takeSnapshot();
 *
 * setInterval(() => {
 *  console.log('transient changed ?', snapshot());
 * }, 1000);
 * ```
 *
 * ### 2) Listening to Transient activity
 *
 * To detect changes happening inside a `Transient`, we could pull/call frequently the `TransientSnapshotChanged` function (see previous example).
 * However, in most cases, this would be inefficient.
 *
 * Instead, we may rely on the `TrackTransientActivity` function, which creates a listener called when _activity_ is detected inside the `Transient`.
 *
 * #### Types
 *
 * ```ts
 * interface Transient {
 *  onActivity: TrackTransientActivity;
 * }
 *
 * interface TrackTransientActivity {
 *   (onActivity: TransientActivity): UndoFunction;
 * }
 *
 * interface TransientActivity {
 *   (): void;
 * }
 * ```
 *
 * #### Example
 *
 * ```ts
 * const snapshot = transient.takeSnapshot();
 *
 * const stopListener = transient.onActivity(() => {
 *   if (snapshot()) {
 *     console.log('transient changed !');
 *     stopListener();
 *   }
 * });
 * ```
 *
 * The _activity_ is not necessarily triggered when the `Transient` changed. It simply happens when a change **MAY exist**.
 *
 * This duality is important, and is one of the key of the reactivity of a `Transient`: a mix between pull (`TransientSnapshotChanged`) and push (`TransientActivity`).
 * That permit to create _lazy_ updates of internal state.
 *
 * ### 3) Capturing the Transient
 *
 * Finally, a `Transient` is made to be _captured_ into the context of a callback.
 *
 * #### Example
 *
 * ```ts
 * const a = new Transient(...);
 * const b = new Transient(...);
 *
 * Transient.runInContext(
 *  (capturedTransient: Transient) => {
 *   console.log('captured', capturedTransient);
 *   // will log `a` and `b`
 *  },
 *  () => {
 *    a.capture();
 *    b.capture();
 *  },
 * );
 * ```
 *
 * This mechanism is used to observe and/or derive many `Transient` in a simple manner.
 */
export interface TransientTrait
  extends TransientTakeSnapshotTrait,
    TransientTrackActivityTrait,
    TransientCaptureTrait {}
