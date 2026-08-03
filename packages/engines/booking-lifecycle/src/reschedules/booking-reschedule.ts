/**
 * Booking Reschedule Boundary — reschedule intent/context for a booking
 * (not Domain transition / Availability / Pricing / Payment / Notification).
 *
 * @see DEC-BOOKING-RESCHEDULE-001
 * @see DEC-BOOKING-CANCELLATION-001
 * @see DEC-BOOKING-AVAILABILITY-001
 */

/** Internal reschedule kinds — not availability or pricing catalogs. */
export const BOOKING_RESCHEDULE_KINDS = {
  /** Reschedule initiated by the customer. */
  CustomerRequested: "booking.customer_requested",
  /** Reschedule initiated by operator/staff. */
  OperatorRequested: "booking.operator_requested",
  /** Reschedule driven by availability constraints. */
  AvailabilityRequired: "booking.availability_required",
  /** Reschedule derived from business policy rules. */
  PolicyRequired: "booking.policy_required",
  /**
   * Reschedule initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingRescheduleKind =
  (typeof BOOKING_RESCHEDULE_KINDS)[keyof typeof BOOKING_RESCHEDULE_KINDS];

export const BOOKING_RESCHEDULE_KIND_VALUES = Object.values(
  BOOKING_RESCHEDULE_KINDS,
) as readonly BookingRescheduleKind[];

/** Reschedule intent status — not a Booking aggregate state. */
export const BOOKING_RESCHEDULE_STATUSES = {
  Requested: "requested",
  Approved: "approved",
  Rejected: "rejected",
  Completed: "completed",
  Cancelled: "cancelled",
} as const;

export type BookingRescheduleStatus =
  (typeof BOOKING_RESCHEDULE_STATUSES)[keyof typeof BOOKING_RESCHEDULE_STATUSES];

export const BOOKING_RESCHEDULE_STATUS_VALUES = Object.values(
  BOOKING_RESCHEDULE_STATUSES,
) as readonly BookingRescheduleStatus[];

/**
 * Opaque reschedule intent/context associated with a booking.
 * No PII, tokens, payment data, or credentials.
 * Time windows are opaque references — not external datetime infra.
 */
export interface BookingReschedule {
  /** Opaque unique reschedule context reference. */
  rescheduleReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Booking subject of the reschedule intent — required. */
  bookingReference: string;
  /** Internal reschedule kind. */
  rescheduleKind: BookingRescheduleKind;
  /** Reschedule intent status. */
  rescheduleStatus: BookingRescheduleStatus;
  /** Opaque current start/window reference — not a live calendar date. */
  currentStartReference: string;
  /** Opaque requested start/window reference — not a live calendar date. */
  requestedStartReference: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque reason pointer — not free-text PII. */
  reasonReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future reschedule adapters (Runtime).
 * Not wired in this foundation — no persist, pricing, or availability providers.
 */
export interface BookingReschedulePort {
  requestReschedule(
    input: CreateBookingRescheduleInput,
  ): Promise<BookingReschedule>;
  completeReschedule(
    reschedule: BookingReschedule,
  ): Promise<BookingReschedule>;
}

export interface CreateBookingRescheduleInput {
  tenantReference: string;
  bookingReference: string;
  rescheduleKind: BookingRescheduleKind;
  currentStartReference: string;
  requestedStartReference: string;
  rescheduleStatus?: BookingRescheduleStatus;
  rescheduleReference?: string;
  actorReference?: string;
  reasonReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingRescheduleKind(
  value: string,
): value is BookingRescheduleKind {
  return (BOOKING_RESCHEDULE_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingRescheduleStatus(
  value: string,
): value is BookingRescheduleStatus {
  return (BOOKING_RESCHEDULE_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingReschedule(
  value: unknown,
): value is BookingReschedule {
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
    typeof candidate.rescheduleReference === "string" &&
    candidate.rescheduleReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    typeof candidate.currentStartReference === "string" &&
    candidate.currentStartReference.length > 0 &&
    typeof candidate.requestedStartReference === "string" &&
    candidate.requestedStartReference.length > 0 &&
    actorOk &&
    reasonOk &&
    typeof candidate.rescheduleKind === "string" &&
    isBookingRescheduleKind(candidate.rescheduleKind) &&
    typeof candidate.rescheduleStatus === "string" &&
    isBookingRescheduleStatus(candidate.rescheduleStatus)
  );
}

export function isBookingReschedulePort(
  value: unknown,
): value is BookingReschedulePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingReschedulePort).requestReschedule === "function" &&
    typeof (value as BookingReschedulePort).completeReschedule === "function"
  );
}
