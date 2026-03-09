import { AsyncSignalLoadingError } from './errors/async-signal-loading-error.js';
import { SignalUnsetError } from './errors/signal-unset-error.js';

export class SignalError<GError = unknown> {
  static error(message?: string, options?: ErrorOptions): SignalError<Error> {
    return new SignalError<Error>(new Error(message, options));
  }

  static readonly UNSET: SignalError<Error> = new SignalError(new SignalUnsetError());

  static readonly LOADING: SignalError<Error> = new SignalError(new AsyncSignalLoadingError());

  readonly error: GError;

  constructor(error: GError) {
    this.error = error;
  }
}
