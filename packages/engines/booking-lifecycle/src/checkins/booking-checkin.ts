/**
 * Booking Check-in Boundary — arrival/presentation context for a booking
 * (not Domain transition / Resource assignment / Payment / Confirmation).
 *
 * @see DEC-BOOKING-CHECKIN-001
 * @see DEC-BOOKING-MODIFICATION-001
 * @see DEC-BOOKING-POLICY-001
 */

/** Internal check-in kinds — not resource or payment catalogs. */
export const BOOKING_CHECK_IN_KINDS = {
  /** Guest/customer arrival. */
  CustomerArrival: "booking.customer_arrival",
  /** Operator-assisted check-in. */
  OperatorAssisted: "booking.operator_assisted",
  /** Manual check-in context. */
  Manual: "booking.manual",
  /** Check-in required by booking policy. */
  PolicyRequired: "booking.policy_required",
  /**
   * Check-in initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingCheckInKind =
  (typeof BOOKING_CHECK_IN_KINDS)[keyof typeof BOOKING_CHECK_IN_KINDS];

export const BOOKING_CHECK_IN_KIND_VALUES = Object.values(
  BOOKING_CHECK_IN_KINDS,
) as readonly BookingCheckInKind[];

/** Check-in intent status — not a Booking aggregate state. */
export const BOOKING_CHECK_IN_STATUSES = {
  Requested: "requested",
  Approved: "approved",
  Completed: "completed",
  Rejected: "rejected",
  Cancelled: "cancelled",
} as const;

export type BookingCheckInStatus =
  (typeof BOOKING_CHECK_IN_STATUSES)[keyof typeof BOOKING_CHECK_IN_STATUSES];

export const BOOKING_CHECK_IN_STATUS_VALUES = Object.values(
  BOOKING_CHECK_IN_STATUSES,
) as readonly BookingCheckInStatus[];

/**
 * Opaque check-in arrival context associated with a booking.
 * No PII, tokens, credentials, or payment data.
 */
export interface BookingCheckIn {
  /** Opaque unique check-in context reference. */
  checkInReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Booking subject of the check-in — required. */
  bookingReference: string;
  /** Internal check-in kind. */
  checkInKind: BookingCheckInKind;
  /** Check-in intent status. */
  checkInStatus: BookingCheckInStatus;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque reason pointer — not free-text PII. */
  reasonReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future check-in adapters (Runtime).
 * Not wired in this foundation — no persist, resource, or payment.
 */
export interface BookingCheckInPort {
  requestCheckIn(input: CreateBookingCheckInInput): Promise<BookingCheckIn>;
  completeCheckIn(checkIn: BookingCheckIn): Promise<BookingCheckIn>;
}

export interface CreateBookingCheckInInput {
  tenantReference: string;
  bookingReference: string;
  checkInKind: BookingCheckInKind;
  checkInStatus?: BookingCheckInStatus;
  checkInReference?: string;
  actorReference?: string;
  reasonReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingCheckInKind(
  value: string,
): value is BookingCheckInKind {
  return (BOOKING_CHECK_IN_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingCheckInStatus(
  value: string,
): value is BookingCheckInStatus {
  return (BOOKING_CHECK_IN_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBookingCheckIn(value: unknown): value is BookingCheckIn {
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
    typeof candidate.checkInReference === "string" &&
    candidate.checkInReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    actorOk &&
    reasonOk &&
    typeof candidate.checkInKind === "string" &&
    isBookingCheckInKind(candidate.checkInKind) &&
    typeof candidate.checkInStatus === "string" &&
    isBookingCheckInStatus(candidate.checkInStatus)
  );
}

export function isBookingCheckInPort(
  value: unknown,
): value is BookingCheckInPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingCheckInPort).requestCheckIn === "function" &&
    typeof (value as BookingCheckInPort).completeCheckIn === "function"
  );
}
