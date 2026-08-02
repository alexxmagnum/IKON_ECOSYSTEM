/**
 * Opaque identifiers for application execution — no Auth/User entities.
 */
export type RequestReference = string;
export type ActorReference = string;

/**
 * Context passed into use-case execution.
 * Actor is a future auth/permissions hook — opaque only in this foundation.
 */
export interface ExecutionContext {
  requestReference?: RequestReference;
  actorReference?: ActorReference;
  /** Explicit tenant scope for Booking (and future domains). */
  tenantReference?: string;
  metadata?: Record<string, unknown>;
}
