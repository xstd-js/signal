/**
 * Represents a batch execution function that processes a batch operation and returns a specified result.
 *
 * In a _batch_ context, multiple signals can be **set** in a single operation.
 *
 * @template GReturn The type of the value returned by the batch operation.
 * @param {RunBatch<GReturn>} fn The function to execute, which performs the batch operation.
 * @returns {GReturn} The result of the batch operation.
 */
export interface Batch {
  <GReturn>(fn: RunBatch<GReturn>): GReturn;
}

/**
 * The _context_ function of a batch operation.
 */
export interface RunBatch<GReturn> {
  (): GReturn;
}
