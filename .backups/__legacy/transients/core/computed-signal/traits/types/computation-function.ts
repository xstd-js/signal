export interface ComputationFunction<GValue> {
  (signal: AbortSignal): Promise<GValue> | GValue;
}
