/**
 * Booking Cancellation Boundary — cancellation intent/context for a booking
 * (not Domain transition / Refund / Payment / Notification / Workflow).
 *
 * @see DEC-BOOKING-CANCELLATION-001
 * @see DEC-BOOKING-EXCEPTION-001
 * @see DEC-BOOKING-POLICY-001
 */

/** Internal cancellation kinds — not refund or payment catalogs. */
export const BOOKING_CANCELLATION_KINDS = {
  /** Cancellation initiated by the customer. */
  CustomerRequested: "booking.customer_requested",
  /** Cancellation initiated by operator/staff. */
  OperatorRequested: "booking.operator_requested",
  /** Cancellation derived from business policy rules. */
  PolicyRequired: "booking.policy_required",
  /** Cancellation related to a business exception (≠ Approval). */
  ExceptionBased: "booking.exception_based",
  /**
   * Cancellation initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingCancellationKind =
  (typeof BOOKING_CANCELLATION_KINDS)[keyof typeof BOOKING_CANCELLATION_KINDS];

export const BOOKING_CANCELLATION_KIND_VALUES = Object.values(
  BOOKING_CANCELLATION_KINDS,
) as readonly BookingCancellationKind[];

/** Cancellation intent status — not a Booking aggregate state. */
export const BOOKING_CANCELLATION_STATUSES = {
  Requested: "requested",
  Approved: "approved",
  Rejected: "rejected",
  Completed: "completed",
  Cancelled: "cancelled",
} as const;

export type BookingCancellationStatus =
  (typeof BOOKING_CANCELLATION_STATUSES)[keyof typeof BOOKING_CANCELLATION_STATUSES];

export const BOOKING_CANCELLATION_STATUS_VALUES = Object.values(
  BOOKING_CANCELLATION_STATUSES,
) as readonly BookingCancellationStatus[];

/**
 * Opaque cancellation intent/context associated with a booking.
 * No emails, phones, tokens, secrets, or payment data.
 */
export interface BookingCancellation {
  /** Opaque unique cancellation context reference. */
  cancellationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Booking subject of the cancellation intent — required. */
  bookingReference: string;
  /** Internal cancellation kind. */
  cancellationKind: BookingCancellationKind;
  /** Cancellation intent status. */
  cancellationStatus: BookingCancellationStatus;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque reason pointer — not free-text PII. */
  reasonReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future cancellation adapters (Runtime).
 * Not wired in this foundation — no persist, refund, email, or webhook.
 */
export interface BookingCancellationPort {
  requestCancellation(
    input: CreateBookingCancellationInput,
  ): Promise<BookingCancellation>;
  completeCancellation(
    cancellation: BookingCancellation,
  ): Promise<BookingCancellation>;
}

export interface CreateBookingCancellationInput {
  tenantReference: string;
  bookingReference: string;
  cancellationKind: BookingCancellationKind;
  cancellationStatus?: BookingCancellationStatus;
  cancellationReference?: string;
  actorReference?: string;
  reasonReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingCancellationKind(
  value: string,
): value is BookingCancellationKind {
  return (BOOKING_CANCELLATION_KIND_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingCancellationStatus(
  value: string,
): value is BookingCancellationStatus {
  return (BOOKING_CANCELLATION_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingCancellation(
  value: unknown,
): value is BookingCancellation {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const reasonOk =
    candidate.reasonReference === undefined ||
    (typeof candidate.reasonReference === "string" &&
      candidate.reasonReference.length > 0);
  return (
    typeof candidate.cancellationReference === "string" &&
    candidate.cancellationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    actorOk &&
    reasonOk &&
    typeof candidate.cancellationKind === "string" &&
    isBookingCancellationKind(candidate.cancellationKind) &&
    typeof candidate.cancellationStatus === "string" &&
    isBookingCancellationStatus(candidate.cancellationStatus)
  );
}

export function isBookingCancellationPort(
  value: unknown,
): value is BookingCancellationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingCancellationPort).requestCancellation ===
      "function" &&
    typeof (value as BookingCancellationPort).completeCancellation ===
      "function"
  );
}
