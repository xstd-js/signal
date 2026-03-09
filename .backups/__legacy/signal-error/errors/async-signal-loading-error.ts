import { CustomError, type CustomErrorOptions } from '@xstd/custom-error';

export class AsyncSignalLoadingError extends CustomError<'AsyncSignalLoadingError'> {
  constructor(options?: CustomErrorOptions) {
    super('AsyncSignalLoadingError', {
      message: 'Signal is loading.',
      ...options,
    });
  }
}
