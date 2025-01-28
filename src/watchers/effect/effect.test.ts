import { describe, expect, it } from 'vitest';
import { ComputedSignal } from '../../transients/core/computed-signal/computed-signal.js';
import { WritableSignal } from '../../transients/core/writable-signal/writable-signal.js';
import { Effect } from './effect.js';
import { type EffectCleanUpFunction } from './traits/types/effect-clean-up-function.js';

describe('Effect', (): void => {
  describe('errors', (): void => {
    it('should prevent nested effects', (): void => {
      let effectCount: number = 0;
      new Effect((): void => {
        effectCount++;
        expect(() => new Effect(() => {})).toThrow();
      });
      expect(effectCount).toBe(1);
    });

    it('should prevent effects in computed', (): void => {
      let computedCount: number = 0;
      const a = new ComputedSignal((): number => {
        computedCount++;
        expect(() => new Effect(() => {})).toThrow();
        return 2;
      });
      expect(a.get()).toBe(2);
      expect(computedCount).toBe(1);
    });
  });

  describe('for writable signal', (): void => {
    it('should be called immediately', (): void => {
      const a = new WritableSignal(1);
      expect(a.get()).toBe(1);

      let effectCount: number = 0;

      new Effect((): void => {
        effectCount++;
        expect(a.get()).toBe(1);
      });
      expect(effectCount).toBe(1);
    });

    it('should be called when a writable signal change', (): Promise<void> => {
      return new Promise<void>((resolve: () => void): void => {
        let setCount: number = 0;
        let effectCount: number = 0;
        let cleanUpCount: number = 0;

        const set = (value: number): void => {
          setCount++;
          _a = value;
          a.set(value);
        };

        const get = (): void => {
          expect(a.get()).toBe(_a);
        };

        let _a: number;
        const a = new WritableSignal(0);
        set(0);
        get();

        new Effect((): EffectCleanUpFunction | void => {
          effectCount++;
          get();

          if (effectCount === 1) {
            expect(setCount).toBe(1);
            return (): void => {
              cleanUpCount++;
            };
          } else if (effectCount === 2) {
            expect(setCount).toBe(3);
            expect(cleanUpCount).toBe(1);
            resolve();
          }
        });

        expect(effectCount).toBe(1);
        set(2);
        set(3);
        expect(effectCount).toBe(1);
      });
    });

    it('should be unsubscribable', (): Promise<void> => {
      return new Promise<void>((resolve: () => void): void => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        let effectCount: number = 0;

        const effect = new Effect((): void => {
          effectCount++;

          if (effectCount === 1) {
            expect(a.get()).toBe(1);
            expect(effectCount).toBe(1);
            resolve();
          }
        });

        // effect.stop();
        effect[Symbol.dispose]();

        a.set(2);
        expect(a.get()).toBe(2);
      });
    });
  });

  describe('for computed signal', (): void => {
    it('should be called immediately', (): Promise<void> => {
      return new Promise<void>((resolve: () => void): void => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => a.get() + 1);
        expect(b.get()).toBe(2);

        new Effect((): void => {
          expect(b.get()).toBe(2);
          resolve();
        });
      });
    });

    it('should be called when a computed signal change', (): Promise<void> => {
      return new Promise<void>((resolve: () => void): void => {
        let setCount: number = 0;
        let effectCount: number = 0;
        let cleanUpCount: number = 0;

        const set = (value: number): void => {
          setCount++;
          _a = value;
          a.set(value);
        };

        const get = (): void => {
          // expect(a()).toBe(_a);
          expect(b.get()).toBe(_a + 1);
        };

        let _a: number;
        const a = new WritableSignal(0);
        const b = new ComputedSignal(() => a.get() + 1);

        set(0);
        get();

        new Effect((): EffectCleanUpFunction | void => {
          effectCount++;
          get();

          if (effectCount === 1) {
            expect(setCount).toBe(1);
            return (): void => {
              cleanUpCount++;
            };
          } else if (effectCount === 2) {
            expect(setCount).toBe(3);
            expect(cleanUpCount).toBe(1);
            resolve();
          }
        });

        expect(effectCount).toBe(1);
        set(2);
        set(3);
        expect(effectCount).toBe(1);
      });
    });
  });

  it('should accept a mix of writable and computed signals', async () => {
    return new Promise<void>((resolve: () => void): void => {
      const a = new WritableSignal(1);
      expect(a.get()).toBe(1);

      const b = new WritableSignal(2);
      expect(b.get()).toBe(2);

      const c = new ComputedSignal(() => a.get() + b.get());
      expect(c.get()).toBe(3);

      let _c = c.get();
      let effectCount: number = 0;

      new Effect((): void => {
        effectCount++;

        expect(a.get() + b.get()).toBe(_c);
        expect(a.get() + b.get()).toBe(c.get());

        if (effectCount === 1) {
          queueMicrotask((): void => {
            a.set(3);
            expect(c.get()).toBe(5);
            _c = 5;
          });
        } else if (effectCount === 2) {
          queueMicrotask((): void => {
            b.set(1);
            expect(c.get()).toBe(4);
            _c = 4;
          });
        } else if (effectCount === 3) {
          resolve();
        }
      });
    });
  });

  it("should be called only once is computed value doesn't change", (): Promise<void> => {
    return new Promise<void>((resolve: () => void, reject: (reason: any) => void): void => {
      const a = new WritableSignal(1);
      expect(a.get()).toBe(1);

      const b = new ComputedSignal(() => a.get() > 0);
      expect(b.get()).toBe(true);

      let effectCount: number = 0;

      new Effect((): void => {
        effectCount++;
        if (effectCount === 1) {
          expect(b.get()).toBe(true);
          queueMicrotask(() => {
            a.set(2);
          });
          setTimeout(() => {
            resolve();
          }, 200);
        } else if (effectCount === 2) {
          expect(b.get()).toBe(true);
          reject('Should not be called again');
        }
      });
    });
  });

  it('should run just once if a signal returns to its initial value', () => {
    return new Promise<void>((resolve: () => void): void => {
      const a = new WritableSignal(1);
      expect(a.get()).toBe(1);

      let effectCount: number = 0;

      new Effect(() => {
        effectCount++;
        if (effectCount === 1) {
          expect(a.get()).toBe(1);
          queueMicrotask(() => {
            a.set(2);
            a.set(1);

            setTimeout(() => {
              a.set(3);
            }, 10);
          });
        } else if (effectCount === 2) {
          expect(a.get()).toBe(3);
          resolve();
        }
      });
    });
  });

  it('should run just once if stopped while signal changes', async () => {
    return new Promise<void>((resolve: () => void, reject: (reason: any) => void): void => {
      const a = new WritableSignal(1);
      expect(a.get()).toBe(1);

      let effectCount: number = 0;

      const effect = new Effect(() => {
        effectCount++;
        if (effectCount === 1) {
          expect(a.get()).toBe(1);
          queueMicrotask(() => {
            a.set(2);
            effect.stop();
            // ensure no errors happen if we stop twice
            effect.stop();

            setTimeout(resolve, 10);
          });
        } else {
          reject(new Error('Called more than once.'));
        }
      });
    });
  });
});
