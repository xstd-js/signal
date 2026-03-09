export interface RunUntracked<GReturn> {
  (): GReturn;
}

export interface Untracked {
  <GReturn>(fn: RunUntracked<GReturn>): GReturn;
}
