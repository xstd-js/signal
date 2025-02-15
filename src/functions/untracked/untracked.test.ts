import { describe, expect, it } from 'vitest';
import { effect } from '../effect/effect.js';
import { signal } from '../signal/signal.js';
import { untracked } from './untracked.js';

describe('untracked', (): void => {
  it('should not track signals', (): Promise<void> => {
    return new Promise<void>((resolve: () => void, reject: (reason?: unknown) => void): void => {
      const a = signal(0);
      const b = signal(1);

      let step: number = 0;

      effect((): void => {
        step++;

        if (step === 1) {
          expect(a()).toBe(0);

          untracked((): void => {
            expect(b()).toBe(1);

            queueMicrotask(() => {
              step++;
              expect(step).toBe(2);
              b.set(2);
            });

            setTimeout((): void => {
              step++;
              expect(step).toBe(3);
              expect(b()).toBe(2);
              a.set(3);
            }, 0);
          });
        } else if (step === 4) {
          expect(untracked(a)).toBe(3);
          expect(untracked(b)).toBe(2);
          resolve();
        } else {
          reject('Invalid step');
        }
      });
    });
  });
});
