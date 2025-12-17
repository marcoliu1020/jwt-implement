/**
 * Pause execution for the specified duration (in milliseconds).
 * Helpful in demos, tests, or simple retry/backoff scenarios.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Return a pseudo-random boolean value.
 * Probability of true is 50% per invocation.
 */
export function flipCoin(): boolean {
  return Math.random() < 0.5;
}
