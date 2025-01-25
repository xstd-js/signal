import { type UndoFunction } from '@xstd/undo-function';
import { describe, expect, it, vi } from 'vitest';
import { testTools } from '../../../../fabrique/test/tools.js';
import { type TransientActivity } from '../transient/traits/types/transient-activity.js';
import { WritableSignal } from '../writable-signal/writable-signal.js';
import { ComputedSignal } from './computed-signal.js';

const sleep = testTools.sleep;

describe('ComputedSignal', () => {
  describe('behaviour', () => {
    describe('base behaviour', () => {
      it('should return the correct computed value from 2 writable signals', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new WritableSignal(2);
        expect(b.get()).toBe(2);

        const c = new ComputedSignal(() => a.get() + b.get());
        expect(c.get()).toBe(3);

        a.set(3);
        expect(c.get()).toBe(5);

        b.set(1);
        expect(c.get()).toBe(4);
      });

      it('should return the correct computed value from another computed signal', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => a.get() + 1);
        expect(b.get()).toBe(2);

        const c = new ComputedSignal(() => b.get() + 1);
        expect(c.get()).toBe(3);

        a.set(3);
        expect(b.get()).toBe(4);
        expect(c.get()).toBe(5);

        a.set(4);
        expect(c.get()).toBe(6);
      });

      it('should support concurrent updates', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => a.get() + a.get());
        expect(b.get()).toBe(2);

        a.set(2);
        expect(b.get()).toBe(4);
      });

      it('should gracefully throw if an error is thrown in the computed function', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => {
          if (a.get() > 1) {
            throw 'error';
          } else {
            return a.get();
          }
        });
        expect(b.get()).toBe(1);

        a.set(2);
        expect(() => b.get()).toThrow('error');

        a.set(0);
        expect(b.get()).toBe(0);
      });
    });

    describe('prevent bad/dangerous practices', () => {
      it('should throw if self referenced -> it detects loops', () => {
        const seconds = new WritableSignal(0);
        expect(seconds.get()).toBe(0);

        const t: ComputedSignal<number> = new ComputedSignal<number>(() =>
          seconds.get() > 0 ? t.get() + 1 : 0,
        );
        expect(t.get()).toBe(0);

        seconds.set(1);
        expect(() => t.get()).toThrow();
      });

      it('should throw if a write is done in the computed function -> it prevents infinite updates', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => {
          expect(() => a.set(10)).toThrow();
          a.set(10);
          return a.get() + 1;
        });
        expect(() => b.get()).toThrow();
      });
    });

    describe('works with interdependent signals', () => {
      it('should handle interdependent signals - greater than', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => a.get() + 1);
        expect(b.get()).toBe(2);

        const c = new ComputedSignal(() => b.get() > a.get());
        expect(c.get()).toBe(true);

        a.set(2);
        expect(c.get()).toBe(true);
        expect(b.get()).toBe(3);
      });

      it('should handle interdependent signals - chain', () => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => a.get() > 10);
        expect(b.get()).toBe(false);

        const c = new ComputedSignal(() => b.get());
        expect(c.get()).toBe(false);

        a.set(2);
        expect(c.get()).toBe(false);

        a.set(20);
        expect(c.get()).toBe(true);
      });

      it('should handle interdependent signals - odd and even', async () => {
        const counter = new WritableSignal(0);
        expect(counter.get()).toBe(0);

        const isEven = new ComputedSignal(() => counter.get() % 2 === 0);
        expect(isEven.get()).toBe(true);

        const message = new ComputedSignal(
          () => `${counter.get()} is ${isEven.get() ? 'even' : 'odd'}`,
        );
        expect(message.get()).toBe('0 is even');

        counter.set(1);
        expect(message.get()).toBe('1 is odd');

        counter.set(2);
        expect(message.get()).toBe('2 is even');
      });
    });

    describe('optimizations', (): void => {
      describe("runs only when it's necessary", (): void => {
        it('should run just once when multiple signals changed in the computed function', () => {
          let count: number = 0;

          const a = new WritableSignal(1);
          expect(a.get()).toBe(1);

          const b = new WritableSignal(2);
          expect(b.get()).toBe(2);

          const c = new ComputedSignal(() => {
            count++;
            return a.get() + b.get();
          });
          expect(count).toBe(0);
          expect(c.get()).toBe(3);
          expect(count).toBe(1);

          a.set(3);
          expect(count).toBe(1);
          b.set(1);
          expect(count).toBe(1);
          expect(c.get()).toBe(4);
          expect(count).toBe(2);
        });

        it('should run just once when multiple interdependent signals changed in the computed function', () => {
          let count: number = 0;

          const counter = new WritableSignal(0);

          const isEven = new ComputedSignal(() => counter.get() % 2 === 0);

          const message = new ComputedSignal(() => {
            count++;
            return `${counter.get()} is ${isEven.get() ? 'even' : 'odd'}`;
          });

          expect(count).toBe(0);
          expect(message.get()).toBe('0 is even');
          expect(count).toBe(1);

          counter.set(1);
          expect(count).toBe(1);
          expect(message.get()).toBe('1 is odd');
          expect(count).toBe(2);

          counter.set(2);
          expect(count).toBe(2);
          expect(message.get()).toBe('2 is even');
          expect(count).toBe(3);
        });

        it('should run just once when working with nested computed signals', () => {
          let count: number = 0;

          const a = new WritableSignal(1);
          expect(a.get()).toBe(1);

          const b = new ComputedSignal(() => a.get() > 10);
          expect(b.get()).toBe(false);

          const c = new ComputedSignal(() => {
            count++;
            return b.get();
          });
          expect(count).toBe(0);
          expect(c.get()).toBe(false);
          expect(count).toBe(1);

          a.set(3);
          expect(count).toBe(1);
          a.set(4);
          expect(count).toBe(1);
          expect(c.get()).toBe(false);
          expect(count).toBe(1);

          a.set(20);
          expect(count).toBe(1);
          expect(c.get()).toBe(true);
          expect(count).toBe(2);
        });

        it('should run just once if a signal returns to its initial value', () => {
          let count: number = 0;

          const a = new WritableSignal(1);
          expect(a.get()).toBe(1);

          const b = new ComputedSignal(() => {
            count++;
            return a.get();
          });

          expect(count).toBe(0);
          expect(b.get()).toBe(1);
          expect(count).toBe(1);

          a.set(-1);
          expect(count).toBe(1);
          a.set(1);
          expect(count).toBe(1);
          expect(b.get()).toBe(1);
          expect(count).toBe(1);

          a.set(2);
          expect(count).toBe(1);
          expect(b.get()).toBe(2);
          expect(count).toBe(2);
        });
      });

      describe('release', (): void => {
        it('should be "released" after some period, and untrack dependency signals', async () => {
          const a = new WritableSignal(1);
          expect(a.get()).toBe(1);

          let tracked: number = 0;

          const nativeTrackActivity = a.trackActivity.bind(a);

          const mocked = vi
            .spyOn(a, 'trackActivity')
            .mockImplementation((onActivity: TransientActivity): UndoFunction => {
              tracked++;
              const undo: UndoFunction = nativeTrackActivity(onActivity);
              return (): void => {
                tracked--;
                undo();
              };
            });

          const b = new ComputedSignal(
            () => {
              return a.get();
            },
            {
              untrackDelay: 0,
            },
          );

          expect(tracked).toBe(0);
          expect(b.get()).toBe(1);
          expect(tracked).toBe(1);

          await sleep(50);

          expect(tracked).toBe(0);

          mocked.mockRestore();
        });

        it('should have the same behaviour, even after being released', async () => {
          let count_b: number = 0;
          let count_c: number = 0;

          const a = new WritableSignal(1);
          expect(a.get()).toBe(1);

          const b = new ComputedSignal(
            () => {
              count_b++;
              return a.get();
            },
            {
              untrackDelay: 100,
            },
          );

          const c = new ComputedSignal(
            () => {
              count_c++;
              return b.get();
            },
            {
              untrackDelay: 200,
            },
          );

          expect(count_b).toBe(0);
          expect(count_c).toBe(0);
          expect(c.get()).toBe(1);
          expect(count_b).toBe(1);
          expect(count_c).toBe(1);

          // b.release();
          await sleep(150);
          expect(c.get()).toBe(1);
          expect(count_b).toBe(1);
          expect(count_c).toBe(1);

          // b.release();
          await sleep(150);
          a.set(2);
          expect(count_b).toBe(1);
          expect(count_c).toBe(1);
          expect(c.get()).toBe(2);
          expect(count_b).toBe(2);
          expect(count_c).toBe(2);

          // b.release();
          // c.release();
          await sleep(250);
          a.set(3);
          expect(count_b).toBe(2);
          expect(count_c).toBe(2);
          expect(c.get()).toBe(3);
          expect(count_b).toBe(3);
          expect(count_c).toBe(3);

          // c.release();
          await sleep(250);
          a.set(4);
          expect(count_b).toBe(3);
          expect(count_c).toBe(3);
          expect(c.get()).toBe(4);
          expect(count_b).toBe(4);
          expect(count_c).toBe(4);
        });
      });
    });
  });
});

describe('unordered', () => {
  describe('on-the-fly signals', () => {
    it('should handle interdependent signals - greater than', () => {
      let count1: number = 0;
      let count2: number = 0;

      const a = new WritableSignal(1);
      expect(a.get()).toBe(1);

      const b = new ComputedSignal((): boolean => {
        count1++;
        return new ComputedSignal((): boolean => {
          count2++;
          return a.get() > 10;
        }).get();
      });

      expect(count1).toBe(0);
      expect(count2).toBe(0);
      expect(b.get()).toBe(false);
      expect(count1).toBe(1);
      expect(count2).toBe(1);

      a.set(2);
      a.set(3);
      expect(b.get()).toBe(false);
      expect(count1).toBe(1);
      expect(count2).toBe(2);

      a.set(20);
      expect(b.get()).toBe(true);
      expect(count1).toBe(2);
      expect(count2).toBe(4);
    });
  });
});
