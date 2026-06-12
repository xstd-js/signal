/**
 * Represents a callable function that allows running a provided operation in an untracked context.
 * When invoked, the `RunUntracked` function is executed, ensuring signals are not observed in this context.
 *
 * @template GReturn The type of the value returned by the `RunUntracked` operation.
 * @param fn A function where signals are not tracked during the execution of the operation.
 * @returns The result of the execution of the `RunUntracked` operation.
 */
export interface Untracked {
  <GReturn>(fn: RunUntracked<GReturn>): GReturn;
}

/**
 * The _context_ function of an untracked operation.
 */
export interface RunUntracked<GReturn> {
  (): GReturn;
}
