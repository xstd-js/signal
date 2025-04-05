import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WritableSignal } from '../../../writable-signal/writable-signal.js';
import { OptimizedAggregateTransient } from './optimized-aggregate-transient.js';

describe('OptimizedAggregateTransient', () => {
  let a: WritableSignal<number>;
  let aggregated: OptimizedAggregateTransient;

  beforeEach(() => {
    a = new WritableSignal(1);
    aggregated = new OptimizedAggregateTransient([a]);
  });

  // it('should return the correct computed value from 2 writable signals', () => {
  //   const changed = aggregated.takeSnapshot();
  //   expect(changed()).toBe(false);
  // });

  it('should prevent 2 consecutive `.takeSnapshot(...)`', () => {
    aggregated.takeSnapshot();
    expect(() => aggregated.takeSnapshot()).toThrow();
  });

  it('should prevent `.trackActivity(...)` if `.takeSnapshot(...)` was not called', () => {
    expect(() => aggregated.trackActivity(() => {})).toThrow();
  });

  it('accepts consecutive `changed(...)` if `.trackActivity(...)` was not called', () => {
    const changed = aggregated.takeSnapshot();
    expect(changed()).toBe(false);
    expect(changed()).toBe(false);
  });

  it('detects changes even if `.trackActivity(...)` was not called', () => {
    const changed = aggregated.takeSnapshot();
    expect(changed()).toBe(false);
    a.set(2);
    expect(changed()).toBe(true);
    a.set(1);
    expect(changed()).toBe(false);
  });

  it('should prevent 2 consecutive `.trackActivity(...)`', () => {
    aggregated.takeSnapshot();
    aggregated.trackActivity(() => {});
    expect(() => aggregated.trackActivity(() => {})).toThrow();
  });

  it('should prevent `changed(...)` if `.trackActivity(...)` did not receive "activity"', () => {
    const changed = aggregated.takeSnapshot();
    const activitySpy = vi.fn();
    aggregated.trackActivity(activitySpy);

    expect(activitySpy).toHaveBeenCalledTimes(0);
    expect(() => changed()).toThrow();
  });

  it('should receive "activity" if the signal changes', () => {
    const changed = aggregated.takeSnapshot();
    const activitySpy = vi.fn();
    aggregated.trackActivity(activitySpy);

    expect(activitySpy).toHaveBeenCalledTimes(0);
    a.set(2);
    expect(activitySpy).toHaveBeenCalledTimes(1);
    expect(activitySpy).toHaveBeenNthCalledWith(1);

    expect(changed()).toBe(true);
  });

  it('should prevent 2 consecutive `changed(...)` after "activity" has been detected', () => {
    const changed = aggregated.takeSnapshot();
    aggregated.trackActivity(() => {});
    a.set(2);
    expect(changed()).toBe(true);
    expect(() => changed()).toThrow();
  });

  it('should support a full change detection cycle', () => {
    const changed = aggregated.takeSnapshot();
    aggregated.trackActivity(() => {});
    a.set(2);
    expect(changed()).toBe(true);

    const activitySpy = vi.fn();
    aggregated.trackActivity(activitySpy);

    expect(activitySpy).toHaveBeenCalledTimes(0);
    a.set(3);
    expect(activitySpy).toHaveBeenCalledTimes(1);
    expect(activitySpy).toHaveBeenNthCalledWith(1);

    expect(changed()).toBe(true);

    aggregated.release();
  });

  it('should be able to untrack activity', () => {
    aggregated.takeSnapshot();
    const activitySpy = vi.fn();
    const untrack = aggregated.trackActivity(activitySpy);

    expect(activitySpy).toHaveBeenCalledTimes(0);
    untrack();

    a.set(3);
    expect(activitySpy).toHaveBeenCalledTimes(0);
  });

  it('should recover and have the same behaviour after release', () => {
    const changed = aggregated.takeSnapshot();
    aggregated.trackActivity(() => {});
    a.set(2);
    expect(changed()).toBe(true);

    aggregated.release();

    expect(changed()).toBe(true);
    aggregated.trackActivity(() => {});

    a.set(1);
    expect(changed()).toBe(false);
  });

  it('should be disposable', () => {
    aggregated[Symbol.dispose]();
  });
});
