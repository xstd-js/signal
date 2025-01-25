export class SignalError<GError = unknown> {
  static error(message?: string, options?: ErrorOptions): SignalError<Error> {
    return new SignalError<Error>(new Error(message, options));
  }

  static readonly UNSET: SignalError<Error> = SignalError.error('Signal is unset.');

  readonly error: GError;

  constructor(error: GError) {
    this.error = error;
  }
}
