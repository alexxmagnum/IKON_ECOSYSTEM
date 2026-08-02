/**
 * Booking Audit Record — traceability fact (who / what / when / tenant).
 * Not a Domain Event and not an Authorization decision.
 *
 * @see DEC-BOOKING-AUDIT-001
 */

/**
 * Audit action tokens for Booking.
 * Correlated with domain lifecycle facts where applicable;
 * `booking.expired` is the audit label for hold expiration
 * (domain event type remains `booking.hold_expired`).
 */
export const BOOKING_AUDIT_ACTIONS = {
  BookingCreated: "booking.created",
  BookingConfirmed: "booking.confirmed",
  BookingCancelled: "booking.cancelled",
  BookingRescheduled: "booking.rescheduled",
  BookingExpired: "booking.expired",
  BookingRead: "booking.read",
} as const;

export type BookingAuditAction =
  (typeof BOOKING_AUDIT_ACTIONS)[keyof typeof BOOKING_AUDIT_ACTIONS];

export const BOOKING_AUDIT_ACTION_VALUES = Object.values(
  BOOKING_AUDIT_ACTIONS,
) as readonly BookingAuditAction[];

/**
 * Traceability record for Booking operations.
 * Opaque references only — no PII dumps, secrets, tokens, or full payloads.
 */
export interface BookingAuditRecord {
  /** Opaque unique audit reference. */
  auditReference: string;
  /** Explicit tenant scope (DEC-BOOKING-TENANT-001). */
  tenantReference: string;
  /** Opaque actor that performed (or requested) the operation. */
  actorReference: string;
  /** Auditable Booking action. */
  action: BookingAuditAction;
  /** Resource kind (e.g. booking, booking.resource). */
  resourceType: string;
  /** Opaque resource reference. */
  resourceReference: string;
  /** When the audited fact occurred (ISO-8601). */
  occurredAt: string;
  /** Controlled optional metadata — never secrets or credentials. */
  metadata?: Record<string, unknown>;
}

export interface CreateBookingAuditRecordInput {
  tenantReference: string;
  actorReference: string;
  action: BookingAuditAction;
  resourceType: string;
  resourceReference: string;
  occurredAt?: string;
  auditReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingAuditAction(
  value: string,
): value is BookingAuditAction {
  return (BOOKING_AUDIT_ACTION_VALUES as readonly string[]).includes(value);
}

export function isBookingAuditRecord(
  value: unknown,
): value is BookingAuditRecord {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.auditReference === "string" &&
    candidate.auditReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.actorReference === "string" &&
    candidate.actorReference.length > 0 &&
    typeof candidate.action === "string" &&
    isBookingAuditAction(candidate.action) &&
    typeof candidate.resourceType === "string" &&
    candidate.resourceType.length > 0 &&
    typeof candidate.resourceReference === "string" &&
    candidate.resourceReference.length > 0 &&
    typeof candidate.occurredAt === "string" &&
    candidate.occurredAt.length > 0
  );
}
