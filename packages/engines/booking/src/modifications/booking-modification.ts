/**
 * Booking Modification Boundary — modification intent/context for a booking
 * (not Domain transition / Reschedule / Cancellation / Pricing / Payment).
 *
 * @see DEC-BOOKING-MODIFICATION-001
 * @see DEC-BOOKING-RESCHEDULE-001
 * @see DEC-BOOKING-CANCELLATION-001
 */

/** Internal modification kinds — not pricing or payment catalogs. */
export const BOOKING_MODIFICATION_KINDS = {
  /** Modification initiated by the customer. */
  CustomerRequested: "booking.customer_requested",
  /** Modification initiated by operator/staff. */
  OperatorRequested: "booking.operator_requested",
  /** Modification required by business rules/context. */
  BusinessRequired: "booking.business_required",
  /** Modification derived from booking policy rules. */
  PolicyRequired: "booking.policy_required",
  /**
   * Modification initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingModificationKind =
  (typeof BOOKING_MODIFICATION_KINDS)[keyof typeof BOOKING_MODIFICATION_KINDS];

export const BOOKING_MODIFICATION_KIND_VALUES = Object.values(
  BOOKING_MODIFICATION_KINDS,
) as readonly BookingModificationKind[];

/** Modification intent status — not a Booking aggregate state. */
export const BOOKING_MODIFICATION_STATUSES = {
  Requested: "requested",
  Approved: "approved",
  Rejected: "rejected",
  Completed: "completed",
  Cancelled: "cancelled",
} as const;

export type BookingModificationStatus =
  (typeof BOOKING_MODIFICATION_STATUSES)[keyof typeof BOOKING_MODIFICATION_STATUSES];

export const BOOKING_MODIFICATION_STATUS_VALUES = Object.values(
  BOOKING_MODIFICATION_STATUSES,
) as readonly BookingModificationStatus[];

/**
 * Opaque modification intent/context associated with a booking.
 * No PII, tokens, credentials, or payment data.
 */
export interface BookingModification {
  /** Opaque unique modification context reference. */
  modificationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Booking subject of the modification intent — required. */
  bookingReference: string;
  /** Internal modification kind. */
  modificationKind: BookingModificationKind;
  /** Modification intent status. */
  modificationStatus: BookingModificationStatus;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque reason pointer — not free-text PII. */
  reasonReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future modification adapters (Runtime).
 * Not wired in this foundation — no persist, pricing, payment, or notification.
 */
export interface BookingModificationPort {
  requestModification(
    input: CreateBookingModificationInput,
  ): Promise<BookingModification>;
  completeModification(
    modification: BookingModification,
  ): Promise<BookingModification>;
}

export interface CreateBookingModificationInput {
  tenantReference: string;
  bookingReference: string;
  modificationKind: BookingModificationKind;
  modificationStatus?: BookingModificationStatus;
  modificationReference?: string;
  actorReference?: string;
  reasonReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingModificationKind(
  value: string,
): value is BookingModificationKind {
  return (BOOKING_MODIFICATION_KIND_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingModificationStatus(
  value: string,
): value is BookingModificationStatus {
  return (BOOKING_MODIFICATION_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingModification(
  value: unknown,
): value is BookingModification {
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
    typeof candidate.modificationReference === "string" &&
    candidate.modificationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    actorOk &&
    reasonOk &&
    typeof candidate.modificationKind === "string" &&
    isBookingModificationKind(candidate.modificationKind) &&
    typeof candidate.modificationStatus === "string" &&
    isBookingModificationStatus(candidate.modificationStatus)
  );
}

export function isBookingModificationPort(
  value: unknown,
): value is BookingModificationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingModificationPort).requestModification ===
      "function" &&
    typeof (value as BookingModificationPort).completeModification ===
      "function"
  );
}
