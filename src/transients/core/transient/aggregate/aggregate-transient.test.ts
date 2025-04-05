import { type UndoFunction } from '@xstd/undo-function';
import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { WritableSignal } from '../../writable-signal/writable-signal.js';

import { TransientActivity } from '../traits/types/transient-activity.js';
import { BasicAggregateTransient } from './basic/basic-aggregate-transient.js';
import { OptimizedAggregateTransient } from './optimized/optimized-aggregate-transient.js';
import { type AggregateTransientTrait } from './traits/aggregate-transient.trait.js';

describe('AggregateTransient', () => {
  let a: WritableSignal<number>;
  let b: WritableSignal<number>;
  let aggregateTransient: AggregateTransientTrait;

  beforeEach(() => {
    a = new WritableSignal(1);
    b = new WritableSignal(2);
  });

  test('a and b values', () => {
    expect(a.get()).toBe(1);
    expect(b.get()).toBe(2);
  });

  describe('BasicAggregateTransient', () => {
    beforeEach(() => {
      aggregateTransient = new BasicAggregateTransient([a, b]);
    });

    test('takeSnapshot', () => {
      const snapshotChanged = aggregateTransient.takeSnapshot();

      expect(snapshotChanged()).toBe(false);

      a.set(2);
      expect(a.get()).toBe(2);
      expect(snapshotChanged()).toBe(true);

      a.set(1);
      expect(a.get()).toBe(1);
      expect(snapshotChanged()).toBe(false);
    });

    describe('trackActivity', () => {
      it('should be called', () => {
        const onActivity = vi.fn<TransientActivity>();
        aggregateTransient.trackActivity(onActivity);

        expect(onActivity).not.toHaveBeenCalled();

        a.set(2);
        expect(onActivity).toHaveBeenCalled();
      });

      it('should be unsubscribable', () => {
        const onActivity = vi.fn<TransientActivity>();
        const stopActivityTracking: UndoFunction = aggregateTransient.trackActivity(onActivity);

        expect(onActivity).not.toHaveBeenCalled();

        stopActivityTracking();

        a.set(2);
        expect(onActivity).not.toHaveBeenCalled();
      });
    });
  });

  describe('OptimizedAggregateTransient', () => {
    beforeEach(() => {
      aggregateTransient = new OptimizedAggregateTransient([a, b]);
    });

    test('workflow', async () => {
      const snapshotChanged = aggregateTransient.takeSnapshot();

      for (const [i, changed] of [
        [2, true],
        [3, true],
        [1, false],
      ] as [number, boolean][]) {
        const { promise, resolve } = Promise.withResolvers<void>();
        const onActivity = vi.fn<TransientActivity>(resolve);
        const stopActivityTracking: UndoFunction = aggregateTransient.trackActivity(onActivity);

        expect(onActivity).not.toHaveBeenCalled();

        expect(() => snapshotChanged()).toThrow();
        expect(() => aggregateTransient.trackActivity(() => {})).toThrow();

        a.set(i);
        expect(onActivity).toHaveBeenCalled();
        await promise;

        expect(snapshotChanged()).toBe(changed);
        expect(() => snapshotChanged()).toThrow();

        stopActivityTracking();
      }
    });
  });
});
