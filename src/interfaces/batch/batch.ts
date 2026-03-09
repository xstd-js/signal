export interface RunBatch<GReturn> {
  (): GReturn;
}

export interface Batch {
  <GReturn>(fn: RunBatch<GReturn>): GReturn;
}
