/**
 * Base domain event contract — facts that already occurred.
 * Opaque references only; no secrets, tokens, or transport concerns.
 */

export interface DomainEvent {
  /** Stable event type discriminator (e.g. booking.created). */
  eventType: string;
  /** Opaque aggregate reference (e.g. booking reference). */
  aggregateReference: string;
  /** When the fact occurred (ISO-8601). */
  occurredAt: string;
  /** Controlled optional metadata — never secrets or credentials. */
  metadata?: Record<string, unknown>;
}

export function isDomainEvent(value: unknown): value is DomainEvent {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.eventType === "string" &&
    candidate.eventType.length > 0 &&
    typeof candidate.aggregateReference === "string" &&
    candidate.aggregateReference.length > 0 &&
    typeof candidate.occurredAt === "string" &&
    candidate.occurredAt.length > 0
  );
}
