import { signal as alien_signal } from 'alien-signals';
import { bench, describe } from 'vitest';
import { signal } from '../../../functions/signal/signal.js';
import { WritableSignal } from './writable-signal.js';

/*
https://codspeed.io/blog/vitest-bench-performance-regressions
 */
describe('WritableSignal', () => {
  describe('new(...)', () => {
    bench('new WritableSignal(...)', () => {
      new WritableSignal(1);
    });

    bench('signal(...)', () => {
      signal(1);
    });

    bench('alien.signal(...)', () => {
      alien_signal(1);
    });
  });

  describe('methods', () => {
    describe('.get(...)', () => {
      const a = new WritableSignal(1);
      const b = signal(1);
      const c = alien_signal(1);

      bench('WritableSignal.get(...)', () => {
        a.get();
      });

      bench('signal.get(...)', () => {
        b();
      });

      bench('alien.signal.get(...)', () => {
        c();
      });
    });

    describe.only('.set(...)', () => {
      const a = new WritableSignal(1);
      const b = signal(1);
      const c = alien_signal(1);

      bench('WritableSignal.set(...)', () => {
        a.set(Math.random());
      });

      bench('signal.set(...)', () => {
        b.set(Math.random());
      });

      bench('alien.signal.set(...)', () => {
        c(Math.random());
      });
    });
  });
});
