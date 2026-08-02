/**
 * Abstract inbound API request envelope.
 * Transport-agnostic — not an HTTP Request / Next.js Request.
 * No User, Session, or JWT entities.
 */
export interface ApiRequest {
  requestReference?: string;
  /** Opaque transport headers (e.g. idempotency key) — not auth material. */
  headers?: Readonly<Record<string, string>>;
  metadata?: Record<string, unknown>;
}
