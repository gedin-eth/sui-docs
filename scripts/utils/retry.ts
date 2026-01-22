/**
 * @file retry.ts
 * @description Retry utility with exponential backoff for handling rate limits and transient errors.
 * 
 * Lesson Learned: Public RPC (Mysten) rate limits at ~100 requests/sec.
 * Need retry logic with exponential backoff and batch parallel requests (10 at a time) instead of 50.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['429', 'Too Many Requests', 'ECONNRESET', 'ETIMEDOUT', 'timeout'],
};

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable based on error message
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  return retryableErrors.some((pattern) => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let delay = opts.initialDelayMs;
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if we've exhausted attempts or error is not retryable
      if (attempt === opts.maxRetries || !isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await sleep(delay);
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Execute multiple promises in batches to avoid rate limits
 * 
 * @param items Array of items to process
 * @param batchSize Number of items to process in parallel (default: 10)
 * @param processor Function that processes each item
 * @returns Array of results in the same order as input
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => retryWithBackoff(() => processor(item)))
    );
    results.push(...batchResults);
  }

  return results;
}
