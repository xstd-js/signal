import { CustomError, CustomErrorOptions } from '@xstd/custom-error';

export class SignalLockedError extends CustomError<'SignalLockedError'> {
  constructor(options?: CustomErrorOptions) {
    super('SignalLockedError', options);
  }
}
