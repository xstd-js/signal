import { beforeEach, describe, expect, it, test, vi } from 'vitest';
import { SignalError } from '../../signal-error/signal-error.js';
import { SignalValueOrError } from '../../signal-value-or-error/signal-value-or-error.js';
import { ComputedSignal } from '../../transients/core/computed-signal/computed-signal.js';
import { WritableSignal } from '../../transients/core/writable-signal/writable-signal.js';
import { SignalWatcher } from './signal-watcher.js';
import { SignalWatcherCleanUpFunction } from './traits/types/signal-watcher-clean-up-function.js';

describe('SignalWatcher', (): void => {
  describe('static', (): void => {
    describe('properties', (): void => {
      test('DISCARD_ERROR', () => {
        expect(SignalWatcher.DISCARD_ERROR('error')).toBe(undefined);
      });

      test('LOG_ERROR', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        SignalWatcher.LOG_ERROR('error');

        expect(consoleSpy).toBeCalledTimes(1);
        expect(consoleSpy).toHaveBeenNthCalledWith(1, 'error');

        consoleSpy.mockReset();
      });
    });

    describe('methods', (): void => {
      describe('.watch(...)', (): void => {
        describe('from a WritableSignal', (): void => {
          let input: WritableSignal<number>;

          beforeEach(() => {
            input = new WritableSignal(1);
          });

          it("should call `onValue` when the signal's value change", (): Promise<void> => {
            return new Promise<void>((resolve: () => void): void => {
              let watcherCount: number = 0;

              SignalWatcher.watch(input, (value: number): void => {
                watcherCount++;

                if (watcherCount === 1) {
                  expect(value).toBe(1);
                  queueMicrotask((): void => {
                    input.set(2);
                  });
                } else if (watcherCount === 2) {
                  expect(value).toBe(2);
                  resolve();
                }
              });
            });
          });

          it('should call `onError` when the signal enters in error state', (): Promise<void> => {
            return new Promise<void>((resolve: () => void, reject: () => void): void => {
              let watcherCount: number = 0;

              SignalWatcher.watch(
                input,
                (value: number): void => {
                  watcherCount++;

                  if (watcherCount === 1) {
                    expect(value).toBe(1);
                    queueMicrotask((): void => {
                      input.throw('error');
                    });
                  } else {
                    reject();
                  }
                },
                (reason: unknown): void => {
                  watcherCount++;

                  if (watcherCount === 2) {
                    expect(reason).toBe('error');
                    resolve();
                  } else {
                    reject();
                  }
                },
              );
            });
          });
        });
      });
    });
  });

  describe('unordered', (): void => {
    describe('errors', (): void => {
      it('should prevent SignalWatcher in computed', (): void => {
        let computedCount: number = 0;
        const a = new ComputedSignal((): number => {
          computedCount++;
          expect(() => new SignalWatcher(new WritableSignal(5), () => {})).toThrow();
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

        let watcherCount: number = 0;

        new SignalWatcher(a, (value: SignalValueOrError<number>): void => {
          watcherCount++;
          expect(value).toBe(1);
        });

        expect(watcherCount).toBe(1);
      });

      it('should support errors', (): void => {
        const error = new Error();
        const a = WritableSignal.thrown<number>(error);
        expect(() => a.get()).toThrow(error);

        let watcherCount: number = 0;

        new SignalWatcher(a, (value: SignalValueOrError<number>): void => {
          watcherCount++;
          expect(value).toBeInstanceOf(SignalError);
          expect((value as SignalError).error).toBe(error);
        });

        expect(watcherCount).toBe(1);
      });

      it('should be called when a writable signal change', (): Promise<void> => {
        return new Promise<void>((resolve: () => void): void => {
          let setCount: number = 0;
          let watcherCount: number = 0;
          let cleanUpCount: number = 0;

          const set = (value: number): void => {
            setCount++;
            _a = value;
            a.set(value);
          };

          const get = (value: number = a.get()): void => {
            expect(value).toBe(_a);
          };

          let _a: number;
          const a = new WritableSignal(0);
          set(0);
          get();

          SignalWatcher.watch(a, (value: number): SignalWatcherCleanUpFunction | void => {
            watcherCount++;
            get(value);

            if (watcherCount === 1) {
              expect(setCount).toBe(1);
              return (): void => {
                cleanUpCount++;
              };
            } else if (watcherCount === 2) {
              expect(setCount).toBe(3);
              expect(cleanUpCount).toBe(1);
              resolve();
            }
          });

          expect(watcherCount).toBe(1);
          set(2);
          set(3);
          expect(watcherCount).toBe(1);
        });
      });

      it('should be unsubscribable', async (): Promise<void> => {
        return new Promise<void>((resolve: () => void): void => {
          const a = new WritableSignal(1);
          expect(a.get()).toBe(1);

          let watcherCount: number = 0;

          const watcher = SignalWatcher.watch(a, (value: number): void => {
            watcherCount++;

            if (watcherCount === 1) {
              expect(value).toBe(1);
              expect(watcherCount).toBe(1);
              resolve();
            }
          });

          // watcher.stop();
          watcher[Symbol.dispose]();

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

          SignalWatcher.watch(b, (value: number): void => {
            expect(value).toBe(2);
            resolve();
          });
        });
      });

      it('should be called when a computed signal change', (): Promise<void> => {
        return new Promise<void>((resolve: () => void): void => {
          let setCount: number = 0;
          let watcherCount: number = 0;
          let cleanUpCount: number = 0;

          const set = (value: number): void => {
            setCount++;
            _a = value;
            a.set(value);
          };

          const get = (value: number = b.get()): void => {
            expect(value).toBe(_a + 1);
          };

          let _a: number;
          const a = new WritableSignal(0);
          const b = new ComputedSignal(() => a.get() + 1);

          set(0);
          get();

          SignalWatcher.watch(b, (value: number): SignalWatcherCleanUpFunction | void => {
            watcherCount++;
            get(value);

            if (watcherCount === 1) {
              expect(setCount).toBe(1);
              return (): void => {
                cleanUpCount++;
              };
            } else if (watcherCount === 2) {
              expect(setCount).toBe(3);
              expect(cleanUpCount).toBe(1);
              resolve();
            }
          });

          expect(watcherCount).toBe(1);
          set(2);
          set(3);
          expect(watcherCount).toBe(1);
        });
      });
    });

    it("should be called only once is computed value doesn't change", (): Promise<void> => {
      return new Promise<void>((resolve: () => void, reject: (reason: any) => void): void => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        const b = new ComputedSignal(() => a.get() > 0);
        expect(b.get()).toBe(true);

        let watcherCount: number = 0;

        SignalWatcher.watch(b, (value: boolean): void => {
          watcherCount++;
          if (watcherCount === 1) {
            expect(value).toBe(true);
            queueMicrotask(() => {
              a.set(2);
            });
            setTimeout(() => {
              resolve();
            }, 200);
          } else if (watcherCount === 2) {
            expect(value).toBe(true);
            reject('Should not be called again');
          }
        });
      });
    });

    it('should run just once if a signal returns to its initial value', () => {
      return new Promise<void>((resolve: () => void): void => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        let watcherCount: number = 0;

        SignalWatcher.watch(a, (value: number) => {
          watcherCount++;
          if (watcherCount === 1) {
            expect(value).toBe(1);
            queueMicrotask(() => {
              a.set(2);
              a.set(1);

              setTimeout(() => {
                a.set(3);
              }, 10);
            });
          } else if (watcherCount === 2) {
            expect(value).toBe(3);
            resolve();
          }
        });
      });
    });

    it('should run just once if stopped while signal changes', async () => {
      return new Promise<void>((resolve: () => void, reject: (reason: any) => void): void => {
        const a = new WritableSignal(1);
        expect(a.get()).toBe(1);

        let watcherCount: number = 0;

        const watcher = SignalWatcher.watch(a, (value: number) => {
          watcherCount++;
          if (watcherCount === 1) {
            expect(value).toBe(1);
            queueMicrotask(() => {
              a.set(2);
              watcher.stop();
              // ensure no errors happen if we stop twice
              watcher.stop();

              setTimeout(resolve, 10);
            });
          } else {
            reject(new Error('Called more than once.'));
          }
        });
      });
    });
  });
});
