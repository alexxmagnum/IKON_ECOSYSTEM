/**
 * API-layer error — client-facing structured failure.
 * Not an HTTP status wrapper; transport mapping is deferred.
 * Aligned with docs/25_API_CONTRACTS.md error object shape (code / message / details).
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
