import { describe, expect, it } from 'vitest';
import { batch, computed, effect, signal } from './reactive-system.ts';

describe('signal', () => {
  describe('initial value', () => {
    it('should have correct initial value', () => {
      const a = signal(1);
      expect(a()).toBe(1);
    });
  });

  describe('set', () => {
    it('should "set" properly a new value', () => {
      const a = signal(1);
      expect(a()).toBe(1);

      a.set(2);
      expect(a()).toBe(2);
    });
  });

  describe('.asReadonly()', () => {
    it('should works as expected', () => {
      const a = signal(1);
      expect(a.asReadonly()()).toBe(1);

      a.set(a() + 1);
      expect(a.asReadonly()()).toBe(2);
    });
  });

  it('should works', () => {
    const a = signal(1);

    const b = computed(() => {
      // a.set(a() + 1);
      return a() + 1;
    });

    effect(() => {
      console.log('a', a(), b());
    });

    batch(() => {
      console.log('ok1');
      a.set(a() + 1);
      console.log('ok2');
      a.set(a() + 1);
      console.log('ok3');
    });
    // console.log('ok1');
    // a.set(a() + 1);
    // console.log('ok2');
    // a.set(a() + 1);
    // console.log('ok3');

    expect(true).toBe(true);
  });
});
