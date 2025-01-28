import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlySignal } from '../readonly-signal/readonly-signal.js';
import { Transient } from '../transient/transient.js';
import { WritableSignal } from './writable-signal.js';

describe('WritableSignal', () => {
  describe('new(...)', () => {
    it('should have correct initial value', () => {
      const a = new WritableSignal(1);
      expect(a.get()).toBe(1);
    });

    it('should throw if no initial value', () => {
      const a = WritableSignal.unset();
      expect(() => a.get()).toThrow();
    });

    it('should throw if errored initial value', () => {
      const error = new Error();
      const a = WritableSignal.thrown(error);
      expect(() => a.get()).toThrow(error);
    });
  });

  describe('methods', () => {
    describe('.capture(...)', () => {
      it('should "throw" if `capture` is called', () => {
        const a = new WritableSignal(1);
        expect(() => a.capture()).toThrow();
      });
    });

    describe('.set(...)', () => {
      it('should "set" properly a new value', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        a.set(2);
        expect(a.get()).toBe(2);
      });
    });

    describe('.throw(...)', () => {
      it('should enter in error state if `throw` is called', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const error = new Error();
        a.throw(error);
        expect(() => a.get()).toThrow(error);

        a.set(2);
        expect(a.get()).toBe(2);
      });
    });

    describe('.update(...)', () => {
      it('should "update" properly a new value', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        a.update((a) => a + 1);
        expect(a.get()).toBe(2);
      });

      it('should throw in a "update" properly', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const error = new Error();
        a.update(() => {
          throw error;
        });
        expect(() => a.get()).toThrow(error);
      });
    });

    describe('.asReadonly(...)', () => {
      it('should return a readonly version', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);
        expect(a.asReadonly().get()).toBe(1);
      });

      describe('ReadonlySignal', () => {
        let a: WritableSignal<number>;
        let b: ReadonlySignal<number>;

        beforeEach(() => {
          a = new WritableSignal(1);
          b = a.asReadonly();
        });

        it('should have the same value', () => {
          expect(b.get()).toBe(1);
          a.set(2);
          expect(b.get()).toBe(2);
        });

        it('should be observable', () => {
          const captured: Transient[] = [];

          Transient.runInContext(
            (transient: Transient): void => {
              captured.push(transient);
            },
            (): void => {
              expect(() => b.capture()).toThrow();
              expect(b.get()).toBe(1);
            },
          );

          expect(captured.length).toBe(1);

          const spy = vi.fn();
          const changed = b.takeSnapshot();
          expect(changed()).toBe(false);

          b.trackActivity(spy);
          expect(spy).toHaveBeenCalledTimes(0);
          a.set(2);
          expect(b.get()).toBe(2);
          expect(spy).toHaveBeenCalledTimes(1);
          expect(changed()).toBe(true);
        });
      });
    });
  });
});
