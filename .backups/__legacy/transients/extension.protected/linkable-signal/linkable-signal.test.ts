import { type UndoFunction } from '@xstd/undo-function';
import { beforeEach, describe, expect, it } from 'vitest';
import { WritableSignal } from '../../core/writable-signal/writable-signal.js';
import { LinkableSignal } from './linkable-signal.js';

describe('LinkableSignal', () => {
  /* START: SAME TESTS AS - WritableSignal */

  describe('initial value', () => {
    it('should have correct initial value', () => {
      const a = new LinkableSignal(1);
      expect(a.get()).toBe(1);
    });

    it('should throw if no initial value', () => {
      const a = LinkableSignal.unset();
      expect(() => a.get()).toThrow();
    });

    it('should throw if errored initial value', () => {
      const error = new Error();
      const a = LinkableSignal.thrown(error);
      expect(() => a.get()).toThrow(error);
    });
  });

  describe('set', () => {
    it('should "set" properly a new value', () => {
      const a = new LinkableSignal(1);
      expect(a.get()).toBe(1);

      a.set(2);
      expect(a.get()).toBe(2);
    });

    it('should "throw" properly an error', () => {
      const a = new LinkableSignal(1);
      expect(a.get()).toBe(1);

      const error = new Error();
      a.throw(error);
      expect(() => a.get()).toThrow(error);

      a.set(2);
      expect(a.get()).toBe(2);
    });
  });

  describe('update', () => {
    it('should "update" properly a new value', () => {
      const a = new LinkableSignal(1);
      expect(a.get()).toBe(1);

      a.update((a) => a + 1);
      expect(a.get()).toBe(2);
    });

    it('should throw in a "update" properly', () => {
      const a = new LinkableSignal(1);
      expect(a.get()).toBe(1);

      const error = new Error();
      a.update(() => {
        throw error;
      });
      expect(() => a.get()).toThrow(error);
    });
  });

  /* END */

  describe('link', () => {
    let a: LinkableSignal<number>;
    let b: WritableSignal<number>;

    beforeEach(() => {
      a = LinkableSignal.unset<number>();
      b = new WritableSignal(1);

      a.link(b);
    });

    it('should be linked', () => {
      expect(a.linked).toBe(true);
    });

    it('should not be locked', () => {
      expect(a.locked).toBe(false);
    });

    it('should prevent duplicate link', () => {
      expect(() => a.link(new WritableSignal(1))).toThrow();
    });

    it('should reflect the linked signal', () => {
      expect(a.get()).toBe(1);

      b.set(2);
      expect(a.get()).toBe(2);

      b.throw('error');
      expect(() => a.get()).toThrow('error');

      b.set(3);
      expect(a.get()).toBe(3);
    });

    it('should unlink correctly', () => {
      expect(a.get()).toBe(1);

      a.unlink();
      expect(a.get()).toBe(1);

      b.set(-1);
      expect(a.get()).toBe(1);

      a.set(2);
      expect(a.get()).toBe(2);
    });

    describe('lock', () => {
      let unlock: UndoFunction;

      beforeEach(() => {
        a.unlink();
        unlock = a.link(b, { lock: true });
      });

      it('should be locked', () => {
        expect(a.locked).toBe(true);
      });

      it('should prevent unlink', () => {
        expect(() => a.unlink()).toThrow();
      });

      it('should unlock correctly', () => {
        expect(a.get()).toBe(1);

        unlock();
        expect(a.get()).toBe(1);

        b.set(-1);
        expect(a.get()).toBe(1);

        a.set(2);
        expect(a.get()).toBe(2);
      });
    });
  });
});
