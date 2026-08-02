/**
 * Booking Exception Boundary — business exceptions in Booking context
 * (not Domain Error / Authorization / Approval / Support / Incident /
 * technical infrastructure failures).
 *
 * @see DEC-BOOKING-EXCEPTION-001
 * @see DEC-BOOKING-APPROVAL-001
 * @see DEC-BOOKING-POLICY-001
 */

/**
 * Internal business exception kinds — not technical/infra error taxonomies.
 * Payment/integration/persistence/runtime failures stay in their own boundaries.
 */
export const BOOKING_EXCEPTION_KINDS = {
  /** Lifecycle conflict (e.g. incompatible reservation). */
  Conflict: "booking.conflict",
  /** Explicit exception required before continuing (e.g. cancel outside policy). */
  OverrideRequired: "booking.override_required",
  /** Needs human review (e.g. VIP / special commercial case). */
  ManualIntervention: "booking.manual_intervention",
  /** Tenant-specific commercial/business rule exception. */
  BusinessException: "booking.business_exception",
  /**
   * Operational Booking process situation — not a technical error.
   * Must not model server, API, provider, or infrastructure failures.
   */
  OperationalException: "booking.operational_exception",
} as const;

export type BookingExceptionKind =
  (typeof BOOKING_EXCEPTION_KINDS)[keyof typeof BOOKING_EXCEPTION_KINDS];

export const BOOKING_EXCEPTION_KIND_VALUES = Object.values(
  BOOKING_EXCEPTION_KINDS,
) as readonly BookingExceptionKind[];

/** Exception treatment status — not a domain validation error code. */
export const BOOKING_EXCEPTION_STATUSES = {
  Pending: "pending",
  Resolved: "resolved",
  Dismissed: "dismissed",
  Expired: "expired",
  Cancelled: "cancelled",
} as const;

export type BookingExceptionStatus =
  (typeof BOOKING_EXCEPTION_STATUSES)[keyof typeof BOOKING_EXCEPTION_STATUSES];

export const BOOKING_EXCEPTION_STATUS_VALUES = Object.values(
  BOOKING_EXCEPTION_STATUSES,
) as readonly BookingExceptionStatus[];

/**
 * Opaque business-exception context associated with a booking operation.
 * No passwords, tokens, API keys, PII, or full logs.
 */
export interface BookingException {
  /** Opaque unique exception context reference. */
  exceptionReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal business exception kind. */
  exceptionKind: BookingExceptionKind;
  /** Exception treatment status. */
  exceptionStatus: BookingExceptionStatus;
  /** Optional booking related to the exception. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque reason pointer — not free-text PII. */
  reasonReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future exception handlers (Runtime).
 * Not wired in this foundation — no tickets, Slack, Jira, or email.
 * `resolveException` updates treatment status — not Policy evaluation.
 */
export interface BookingExceptionPort {
  registerException(
    input: CreateBookingExceptionInput,
  ): Promise<BookingException>;
  resolveException(exception: BookingException): Promise<BookingException>;
}

export interface CreateBookingExceptionInput {
  tenantReference: string;
  exceptionKind: BookingExceptionKind;
  exceptionStatus?: BookingExceptionStatus;
  exceptionReference?: string;
  bookingReference?: string;
  actorReference?: string;
  reasonReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingExceptionKind(
  value: string,
): value is BookingExceptionKind {
  return (BOOKING_EXCEPTION_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingExceptionStatus(
  value: string,
): value is BookingExceptionStatus {
  return (BOOKING_EXCEPTION_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingException(value: unknown): value is BookingException {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const reasonOk =
    candidate.reasonReference === undefined ||
    (typeof candidate.reasonReference === "string" &&
      candidate.reasonReference.length > 0);
  return (
    typeof candidate.exceptionReference === "string" &&
    candidate.exceptionReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    reasonOk &&
    typeof candidate.exceptionKind === "string" &&
    isBookingExceptionKind(candidate.exceptionKind) &&
    typeof candidate.exceptionStatus === "string" &&
    isBookingExceptionStatus(candidate.exceptionStatus)
  );
}

export function isBookingExceptionPort(
  value: unknown,
): value is BookingExceptionPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingExceptionPort).registerException === "function" &&
    typeof (value as BookingExceptionPort).resolveException === "function"
  );
}
