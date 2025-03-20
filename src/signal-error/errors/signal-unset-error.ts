import { CustomError, type CustomErrorOptions } from '@xstd/custom-error';

export class SignalUnsetError extends CustomError<'SignalUnsetError'> {
  constructor(options?: CustomErrorOptions) {
    super('SignalUnsetError', {
      message: 'Signal is unset.',
      ...options,
    });
  }
}
