import { describe, expect, it } from 'vitest';
import { SignalError } from './signal-error.js';

describe('SignalError', () => {
  describe('new(...)', () => {
    it('should construct and be initialized', () => {
      const error = new Error();
      const signalError = new SignalError(error);
      expect(signalError.error).toBe(error);
    });
  });

  describe('static methods', () => {
    describe('.error(...)', () => {
      it('should create an error with provided message', () => {
        const message: string = 'test';
        const signalError = SignalError.error(message);
        expect(signalError.error.message).toBe(message);
      });
    });
  });
});
