import { describe, expect, it, vi } from 'vitest';
import { testTools } from '../../../fabrique/test/tools.js';
import { SignalError } from '../../signal-error/signal-error.js';
import { signal } from '../signal/signal.js';
import { watch } from './watch.js';

describe('watch', () => {
  describe('watch', () => {
    it('should watch properly another signal', async () => {
      const a = signal(1);
      const spy = vi.fn();
      watch(a, spy);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenNthCalledWith(1, 1);

      a.set(2);
      await testTools.sleep(0);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(2, 2);
    });

    it('should support errors', () => {
      const a = signal.thrown('error');
      const spy = vi.fn();
      watch(a, spy);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.lastCall![0] instanceof SignalError).toBe(true);
      expect(spy.mock.lastCall![0].error).toBe('error');
    });

    it('should be unsubscribable', () => {
      const a = signal(1);
      const spy = vi.fn();
      const unsubscribe = watch(a, spy);
      expect(spy).toHaveBeenCalledTimes(1);
      unsubscribe();

      a.set(2);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('watch.value', () => {
    it('should watch properly another signal', async () => {
      const a = signal(1);
      const spy = vi.fn();
      watch.value(a, spy);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenNthCalledWith(1, 1);

      a.set(2);
      await testTools.sleep(0);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(2, 2);
    });

    it('should support errors', () => {
      const a = signal.thrown('error');
      const spyA = vi.fn();
      const spyB = vi.fn();
      watch.value(a, spyA, spyB);
      expect(spyA).toHaveBeenCalledTimes(0);
      expect(spyB).toHaveBeenCalledTimes(1);
      expect(spyB).toHaveBeenNthCalledWith(1, 'error');
    });

    it('should be unsubscribable', () => {
      const a = signal(1);
      const spy = vi.fn();
      const unsubscribe = watch.value(a, spy);
      expect(spy).toHaveBeenCalledTimes(1);
      unsubscribe();

      a.set(2);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
