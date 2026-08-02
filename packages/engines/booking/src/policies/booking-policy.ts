/**
 * Booking Policy Boundary — configurable business-condition evaluation.
 * Distinct from Authorization (may they?) and Domain Rules (is transition valid?).
 *
 * @see DEC-BOOKING-POLICY-001
 * @see DEC-BOOKING-AUTH-001
 */

/** Internal policy operations aligned with Booking lifecycle. */
export const BOOKING_POLICY_OPERATIONS = {
  Create: "booking.create",
  Confirm: "booking.confirm",
  Cancel: "booking.cancel",
  Reschedule: "booking.reschedule",
} as const;

export type BookingPolicyOperation =
  (typeof BOOKING_POLICY_OPERATIONS)[keyof typeof BOOKING_POLICY_OPERATIONS];

export const BOOKING_POLICY_OPERATION_VALUES = Object.values(
  BOOKING_POLICY_OPERATIONS,
) as readonly BookingPolicyOperation[];

/**
 * Opaque context for a business-policy evaluation.
 * No emails, phones, JWT, tokens, or secrets.
 */
export interface BookingPolicyRequest {
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Opaque actor — required. */
  actorReference: string;
  /** Policy operation under evaluation. */
  operation: BookingPolicyOperation;
  /** Optional booking related to the evaluation. */
  bookingReference?: string;
  /**
   * Optional tenant of the booking aggregate — when present must match
   * `tenantReference` (cross-tenant denial).
   */
  bookingTenantReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a Booking business-policy evaluation.
 * Not an Authorization decision and not a Domain Rule failure.
 */
export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  policyReference?: string;
}

/**
 * Booking business Policy — answers “does this operation meet current business conditions?”
 */
export interface BookingPolicy {
  evaluate(request: BookingPolicyRequest): Promise<PolicyDecision>;
}

export function isBookingPolicyOperation(
  value: string,
): value is BookingPolicyOperation {
  return (BOOKING_POLICY_OPERATION_VALUES as readonly string[]).includes(value);
}

export function isPolicyDecision(value: unknown): value is PolicyDecision {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate.allowed === "boolean";
}

export function isBookingPolicy(value: unknown): value is BookingPolicy {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingPolicy).evaluate === "function"
  );
}
