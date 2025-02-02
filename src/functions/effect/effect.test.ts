import { describe, expect, it } from 'vitest';
import { signal } from '../signal/signal.js';
import { effect } from './effect.js';

describe('effect', () => {
  it('should watch properly another signal', () => {
    return new Promise<void>(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: any) => void,
      ): void => {
        const a = signal(1);

        let count: number = 0;

        effect((): void => {
          count++;
          if (count === 1) {
            expect(a()).toBe(1);
            queueMicrotask(() => {
              a.set(2);
            });
          } else if (count === 2) {
            resolve();
          } else {
            reject();
          }
        });

        expect(count).toBe(1);
      },
    );
  });

  it('should be unsubscribable', () => {
    return new Promise<void>(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: any) => void,
      ): void => {
        const a = signal(1);

        let count: number = 0;

        const unsubscribe = effect((): void => {
          count++;
          if (count === 1) {
            expect(a()).toBe(1);
            queueMicrotask(() => {
              a.set(2);
            });
          } else {
            reject();
          }
        });

        expect(count).toBe(1);
        unsubscribe();

        setTimeout(resolve, 10);
      },
    );
  });
});
