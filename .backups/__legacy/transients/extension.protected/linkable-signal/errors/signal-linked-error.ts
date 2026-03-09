import { CustomError, CustomErrorOptions } from '@xstd/custom-error';

export class SignalLinkedError extends CustomError<'SignalLinkedError'> {
  constructor(options?: CustomErrorOptions) {
    super('SignalLinkedError', options);
  }
}
