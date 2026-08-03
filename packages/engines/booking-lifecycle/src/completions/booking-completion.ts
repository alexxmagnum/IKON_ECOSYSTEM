/**
 * Booking Completion Boundary — finalization context for a booking experience
 * (not Domain transition / Settlement / Payment / Invoice / Resource release).
 *
 * @see DEC-BOOKING-COMPLETION-001
 * @see DEC-BOOKING-CHECKIN-001
 * @see DEC-BOOKING-SETTLEMENT-001
 */

/** Internal completion kinds — not settlement or payment catalogs. */
export const BOOKING_COMPLETION_KINDS = {
  /** Service experience finished. */
  ServiceCompleted: "booking.service_completed",
  /** Customer marked the booking as completed. */
  CustomerCompleted: "booking.customer_completed",
  /** Operator marked the booking as completed. */
  OperatorCompleted: "booking.operator_completed",
  /** Requires manual review before completion. */
  ManualReview: "booking.manual_review",
  /**
   * Completion initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingCompletionKind =
  (typeof BOOKING_COMPLETION_KINDS)[keyof typeof BOOKING_COMPLETION_KINDS];

export const BOOKING_COMPLETION_KIND_VALUES = Object.values(
  BOOKING_COMPLETION_KINDS,
) as readonly BookingCompletionKind[];

/** Completion intent status — not a Booking aggregate state. */
export const BOOKING_COMPLETION_STATUSES = {
  Requested: "requested",
  Approved: "approved",
  Completed: "completed",
  Rejected: "rejected",
  Cancelled: "cancelled",
} as const;

export type BookingCompletionStatus =
  (typeof BOOKING_COMPLETION_STATUSES)[keyof typeof BOOKING_COMPLETION_STATUSES];

export const BOOKING_COMPLETION_STATUS_VALUES = Object.values(
  BOOKING_COMPLETION_STATUSES,
) as readonly BookingCompletionStatus[];

/**
 * Opaque completion context associated with a booking.
 * No PII, tokens, credentials, or payment data.
 */
export interface BookingCompletion {
  /** Opaque unique completion context reference. */
  completionReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Booking subject of the completion — required. */
  bookingReference: string;
  /** Internal completion kind. */
  completionKind: BookingCompletionKind;
  /** Completion intent status. */
  completionStatus: BookingCompletionStatus;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque reason pointer — not free-text PII. */
  reasonReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future completion adapters (Runtime).
 * Not wired in this foundation — no persist, settlement, payment, or resource release.
 */
export interface BookingCompletionPort {
  requestCompletion(
    input: CreateBookingCompletionInput,
  ): Promise<BookingCompletion>;
  completeCompletion(
    completion: BookingCompletion,
  ): Promise<BookingCompletion>;
}

export interface CreateBookingCompletionInput {
  tenantReference: string;
  bookingReference: string;
  completionKind: BookingCompletionKind;
  completionStatus?: BookingCompletionStatus;
  completionReference?: string;
  actorReference?: string;
  reasonReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingCompletionKind(
  value: string,
): value is BookingCompletionKind {
  return (BOOKING_COMPLETION_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingCompletionStatus(
  value: string,
): value is BookingCompletionStatus {
  return (BOOKING_COMPLETION_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingCompletion(
  value: unknown,
): value is BookingCompletion {
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
    typeof candidate.completionReference === "string" &&
    candidate.completionReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    actorOk &&
    reasonOk &&
    typeof candidate.completionKind === "string" &&
    isBookingCompletionKind(candidate.completionKind) &&
    typeof candidate.completionStatus === "string" &&
    isBookingCompletionStatus(candidate.completionStatus)
  );
}

export function isBookingCompletionPort(
  value: unknown,
): value is BookingCompletionPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingCompletionPort).requestCompletion === "function" &&
    typeof (value as BookingCompletionPort).completeCompletion === "function"
  );
}
