import { describe, expect, it, test } from 'vitest';
import {
  batch,
  computed,
  effect,
  expectBatch,
  expectUntracked,
  signal,
  untracked,
} from './reactive-system.ts';

describe('reactive-system', () => {
  describe('signal', () => {
    describe('initial value', () => {
      it('should have expected initial value', () => {
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
      it("should reflect origin signal's", () => {
        const a = signal(1);
        expect(a.asReadonly()()).toBe(1);

        a.set(a() + 1);
        expect(a.asReadonly()()).toBe(2);
      });
    });

    describe('effect', () => {
      it('should be observable', () => {
        const a = signal(2);
        let count: number = 0;
        let cleanUpCount: number = 0;
        let _a!: number;

        const stopEffect = effect(() => {
          count++;
          _a = a();

          return () => {
            cleanUpCount++;
          };
        });

        expect(count).toBe(1);
        expect(_a).toBe(2);
        expect(cleanUpCount).toBe(0);

        a.set(3);

        expect(count).toBe(2);
        expect(_a).toBe(3);
        expect(cleanUpCount).toBe(1);

        a.set(4);

        expect(count).toBe(3);
        expect(_a).toBe(4);
        expect(cleanUpCount).toBe(2);

        stopEffect();

        expect(count).toBe(3);
        expect(_a).toBe(4);
        expect(cleanUpCount).toBe(3);

        a.set(5);

        expect(count).toBe(3);
        expect(_a).toBe(4);
        expect(cleanUpCount).toBe(3);
      });
    });

    test.skip('debug', () => {
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

  describe('computed', () => {
    it('should be computed from other signals', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a() * b());
      expect(c()).toBe(6);

      a.set(5);
      expect(c()).toBe(15);
    });
  });

  describe('batch', () => {
    it('should apply changes in batch', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a() * b());

      let count: number = 0;
      let _c!: number;

      effect(() => {
        count++;
        _c = c();
      });

      expect(count).toBe(1);
      expect(_c).toBe(6);

      batch(() => {
        a.set(5);
        expect(count).toBe(1);
        b.set(4);
        expect(count).toBe(1);
      });

      expect(count).toBe(2);
      expect(_c).toBe(20);
    });

    describe('expectBatch', () => {
      it('should be expected in a batch', () => {
        batch(() => {
          expect(() => expectBatch()).not.toThrow();
        });
      });

      it('should throw outside of in a batch', () => {
        expect(() => expectBatch()).toThrow();
      });
    });
  });

  describe('untracked', () => {
    it('should not track untracked signals', () => {
      const a = signal(1);

      let count: number = 0;
      let _a!: number;

      effect(() => {
        count++;
        _a = untracked(a);
      });

      expect(count).toBe(1);
      expect(_a).toBe(1);

      a.set(5);
      expect(count).toBe(1);
      expect(_a).toBe(1);
      expect(a()).toBe(5);
    });

    describe('expectUntracked', () => {
      it('should be expected in a untracked context', () => {
        untracked(() => {
          expect(() => expectUntracked()).not.toThrow();
        });
      });

      it('should throw outside of in a untracked context', () => {
        effect(() => {
          expect(() => expectUntracked()).toThrow();
        });
      });
    });
  });
});
