/**
 * Booking No-Show Boundary — absence context when expected actor did not present
 * (not Domain transition / Cancellation / Check-in / Fee / Payment / Resource).
 *
 * @see DEC-BOOKING-NOSHOW-001
 * @see DEC-BOOKING-CHECKIN-001
 * @see DEC-BOOKING-CANCELLATION-001
 */

/** Internal no-show kinds — not fee or payment catalogs. */
export const BOOKING_NO_SHOW_KINDS = {
  /** Expected customer/guest did not arrive. */
  CustomerAbsent: "booking.customer_absent",
  /** Operator marked the booking as no-show. */
  OperatorMarked: "booking.operator_marked",
  /** No-show required by booking policy. */
  PolicyRequired: "booking.policy_required",
  /**
   * No-show initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
  /** Requires manual review before confirmation. */
  ManualReview: "booking.manual_review",
} as const;

export type BookingNoShowKind =
  (typeof BOOKING_NO_SHOW_KINDS)[keyof typeof BOOKING_NO_SHOW_KINDS];

export const BOOKING_NO_SHOW_KIND_VALUES = Object.values(
  BOOKING_NO_SHOW_KINDS,
) as readonly BookingNoShowKind[];

/** No-show treatment status — not a Booking aggregate state. */
export const BOOKING_NO_SHOW_STATUSES = {
  Detected: "detected",
  ReviewPending: "review_pending",
  Confirmed: "confirmed",
  Rejected: "rejected",
  Cancelled: "cancelled",
} as const;

export type BookingNoShowStatus =
  (typeof BOOKING_NO_SHOW_STATUSES)[keyof typeof BOOKING_NO_SHOW_STATUSES];

export const BOOKING_NO_SHOW_STATUS_VALUES = Object.values(
  BOOKING_NO_SHOW_STATUSES,
) as readonly BookingNoShowStatus[];

/**
 * Opaque no-show context associated with a booking.
 * No PII, tokens, credentials, or payment data.
 */
export interface BookingNoShow {
  /** Opaque unique no-show context reference. */
  noShowReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Booking subject of the no-show — required. */
  bookingReference: string;
  /** Internal no-show kind. */
  noShowKind: BookingNoShowKind;
  /** No-show treatment status. */
  noShowStatus: BookingNoShowStatus;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque reason pointer — not free-text PII. */
  reasonReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future no-show adapters (Runtime).
 * Not wired in this foundation — no persist, fee, payment, or resource release.
 */
export interface BookingNoShowPort {
  registerNoShow(input: CreateBookingNoShowInput): Promise<BookingNoShow>;
  resolveNoShow(noShow: BookingNoShow): Promise<BookingNoShow>;
}

export interface CreateBookingNoShowInput {
  tenantReference: string;
  bookingReference: string;
  noShowKind: BookingNoShowKind;
  noShowStatus?: BookingNoShowStatus;
  noShowReference?: string;
  actorReference?: string;
  reasonReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingNoShowKind(
  value: string,
): value is BookingNoShowKind {
  return (BOOKING_NO_SHOW_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingNoShowStatus(
  value: string,
): value is BookingNoShowStatus {
  return (BOOKING_NO_SHOW_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBookingNoShow(value: unknown): value is BookingNoShow {
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
    typeof candidate.noShowReference === "string" &&
    candidate.noShowReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    actorOk &&
    reasonOk &&
    typeof candidate.noShowKind === "string" &&
    isBookingNoShowKind(candidate.noShowKind) &&
    typeof candidate.noShowStatus === "string" &&
    isBookingNoShowStatus(candidate.noShowStatus)
  );
}

export function isBookingNoShowPort(
  value: unknown,
): value is BookingNoShowPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingNoShowPort).registerNoShow === "function" &&
    typeof (value as BookingNoShowPort).resolveNoShow === "function"
  );
}
