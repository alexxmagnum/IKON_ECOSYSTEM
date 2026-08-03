/**
 * Booking Waitlist Boundary — waiting intent when no availability yet
 * (not Availability check / Resource assignment / Booking creation / Notification).
 *
 * @see DEC-BOOKING-WAITLIST-001
 * @see DEC-BOOKING-AVAILABILITY-001
 */

/** Internal waitlist kinds — not availability or booking catalogs. */
export const BOOKING_WAITLIST_KINDS = {
  /** Customer requested waitlist placement. */
  CustomerRequested: "booking.customer_requested",
  /** Operator created the waitlist entry. */
  OperatorCreated: "booking.operator_created",
  /** Waitlist driven by missing availability. */
  AvailabilityRequired: "booking.availability_required",
  /** Waitlist driven by capacity constraints. */
  CapacityRequired: "booking.capacity_required",
  /**
   * Waitlist initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingWaitlistKind =
  (typeof BOOKING_WAITLIST_KINDS)[keyof typeof BOOKING_WAITLIST_KINDS];

export const BOOKING_WAITLIST_KIND_VALUES = Object.values(
  BOOKING_WAITLIST_KINDS,
) as readonly BookingWaitlistKind[];

/** Waitlist intent status — not a Booking aggregate state. */
export const BOOKING_WAITLIST_STATUSES = {
  /** Waiting for availability. */
  Waiting: "waiting",
  /** Opportunity exists / notified. */
  Notified: "notified",
  /** Customer accepted the opportunity. */
  Accepted: "accepted",
  /** Will convert to a future booking. */
  Converted: "converted",
  /** Lost validity. */
  Expired: "expired",
  /** Cancelled. */
  Cancelled: "cancelled",
} as const;

export type BookingWaitlistStatus =
  (typeof BOOKING_WAITLIST_STATUSES)[keyof typeof BOOKING_WAITLIST_STATUSES];

export const BOOKING_WAITLIST_STATUS_VALUES = Object.values(
  BOOKING_WAITLIST_STATUSES,
) as readonly BookingWaitlistStatus[];

/**
 * Opaque waitlist intent — may exist before any Booking.
 * No PII, payment data, or credentials.
 */
export interface BookingWaitlist {
  /** Opaque unique waitlist context reference. */
  waitlistReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal waitlist kind. */
  waitlistKind: BookingWaitlistKind;
  /** Waitlist intent status. */
  waitlistStatus: BookingWaitlistStatus;
  /** Optional booking if one already exists or was later linked. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque availability context pointer — not a live calendar query. */
  availabilityReference?: string;
  /** Opaque requested date/window pointer — not a live datetime. */
  requestedDateReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future waitlist adapters (Runtime).
 * Not wired in this foundation — no DB, email, WhatsApp, or push.
 */
export interface BookingWaitlistPort {
  requestWaitlist(
    input: CreateBookingWaitlistInput,
  ): Promise<BookingWaitlist>;
  resolveWaitlist(waitlist: BookingWaitlist): Promise<BookingWaitlist>;
}

export interface CreateBookingWaitlistInput {
  tenantReference: string;
  waitlistKind: BookingWaitlistKind;
  waitlistStatus?: BookingWaitlistStatus;
  waitlistReference?: string;
  bookingReference?: string;
  actorReference?: string;
  availabilityReference?: string;
  requestedDateReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingWaitlistKind(
  value: string,
): value is BookingWaitlistKind {
  return (BOOKING_WAITLIST_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingWaitlistStatus(
  value: string,
): value is BookingWaitlistStatus {
  return (BOOKING_WAITLIST_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBookingWaitlist(value: unknown): value is BookingWaitlist {
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
  const availabilityOk =
    candidate.availabilityReference === undefined ||
    (typeof candidate.availabilityReference === "string" &&
      candidate.availabilityReference.length > 0);
  const requestedDateOk =
    candidate.requestedDateReference === undefined ||
    (typeof candidate.requestedDateReference === "string" &&
      candidate.requestedDateReference.length > 0);
  return (
    typeof candidate.waitlistReference === "string" &&
    candidate.waitlistReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    availabilityOk &&
    requestedDateOk &&
    typeof candidate.waitlistKind === "string" &&
    isBookingWaitlistKind(candidate.waitlistKind) &&
    typeof candidate.waitlistStatus === "string" &&
    isBookingWaitlistStatus(candidate.waitlistStatus)
  );
}

export function isBookingWaitlistPort(
  value: unknown,
): value is BookingWaitlistPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingWaitlistPort).requestWaitlist === "function" &&
    typeof (value as BookingWaitlistPort).resolveWaitlist === "function"
  );
}
