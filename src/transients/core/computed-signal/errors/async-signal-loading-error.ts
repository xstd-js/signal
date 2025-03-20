import { CustomError, CustomErrorOptions } from '@xstd/custom-error';

export class AsyncSignalLoadingError extends CustomError<'AsyncSignalLoadingError'> {
  constructor(options?: CustomErrorOptions) {
    super('AsyncSignalLoadingError', options);
  }
}
