export class SignalLinkedError extends Error {
  constructor(message: string = 'Signal already linked.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'SignalLinkedError';
  }
}
