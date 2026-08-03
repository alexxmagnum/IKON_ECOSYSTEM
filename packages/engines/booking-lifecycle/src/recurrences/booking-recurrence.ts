/**
 * Booking Recurrence Boundary — repetition rule for a booking intent
 * (not Calendar Engine / auto Booking generation / Availability / Payment).
 *
 * @see DEC-BOOKING-RECURRENCE-001
 * @see DEC-BOOKING-WAITLIST-001
 */

/** Internal recurrence kinds — not calendar RRULE or billing catalogs. */
export const BOOKING_RECURRENCE_KINDS = {
  /** Repeats weekly (e.g. every Tuesday). */
  Weekly: "booking.weekly",
  /** Repeats daily. */
  Daily: "booking.daily",
  /** Repeats monthly (e.g. first Monday). */
  Monthly: "booking.monthly",
  /** Custom/special recurrence rule. */
  Custom: "booking.custom",
  /**
   * Recurrence initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingRecurrenceKind =
  (typeof BOOKING_RECURRENCE_KINDS)[keyof typeof BOOKING_RECURRENCE_KINDS];

export const BOOKING_RECURRENCE_KIND_VALUES = Object.values(
  BOOKING_RECURRENCE_KINDS,
) as readonly BookingRecurrenceKind[];

/** Recurrence rule status — not a Booking aggregate or scheduler state. */
export const BOOKING_RECURRENCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Completed: "completed",
  Cancelled: "cancelled",
  Expired: "expired",
} as const;

export type BookingRecurrenceStatus =
  (typeof BOOKING_RECURRENCE_STATUSES)[keyof typeof BOOKING_RECURRENCE_STATUSES];

export const BOOKING_RECURRENCE_STATUS_VALUES = Object.values(
  BOOKING_RECURRENCE_STATUSES,
) as readonly BookingRecurrenceStatus[];

/**
 * Opaque recurrence rule context for a booking intent.
 * May exist before any Booking instance is created.
 * No PII, payment data, or credentials.
 */
export interface BookingRecurrence {
  /** Opaque unique recurrence rule reference. */
  recurrenceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal recurrence kind. */
  recurrenceKind: BookingRecurrenceKind;
  /** Recurrence rule status. */
  recurrenceStatus: BookingRecurrenceStatus;
  /** Optional booking if one instance or template is already linked. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque pattern pointer — not a live RRULE engine. */
  patternReference?: string;
  /** Opaque recurrence start pointer — not a live calendar datetime. */
  startReference?: string;
  /** Opaque recurrence end pointer — not a live calendar datetime. */
  endReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future recurrence adapters (Runtime).
 * Not wired in this foundation — no cron, scheduler, or mass booking generation.
 */
export interface BookingRecurrencePort {
  createRecurrence(
    input: CreateBookingRecurrenceInput,
  ): Promise<BookingRecurrence>;
  resolveRecurrence(
    recurrence: BookingRecurrence,
  ): Promise<BookingRecurrence>;
}

export interface CreateBookingRecurrenceInput {
  tenantReference: string;
  recurrenceKind: BookingRecurrenceKind;
  recurrenceStatus?: BookingRecurrenceStatus;
  recurrenceReference?: string;
  bookingReference?: string;
  actorReference?: string;
  patternReference?: string;
  startReference?: string;
  endReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingRecurrenceKind(
  value: string,
): value is BookingRecurrenceKind {
  return (BOOKING_RECURRENCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingRecurrenceStatus(
  value: string,
): value is BookingRecurrenceStatus {
  return (BOOKING_RECURRENCE_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingRecurrence(
  value: unknown,
): value is BookingRecurrence {
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
  const patternOk =
    candidate.patternReference === undefined ||
    (typeof candidate.patternReference === "string" &&
      candidate.patternReference.length > 0);
  const startOk =
    candidate.startReference === undefined ||
    (typeof candidate.startReference === "string" &&
      candidate.startReference.length > 0);
  const endOk =
    candidate.endReference === undefined ||
    (typeof candidate.endReference === "string" &&
      candidate.endReference.length > 0);
  return (
    typeof candidate.recurrenceReference === "string" &&
    candidate.recurrenceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    patternOk &&
    startOk &&
    endOk &&
    typeof candidate.recurrenceKind === "string" &&
    isBookingRecurrenceKind(candidate.recurrenceKind) &&
    typeof candidate.recurrenceStatus === "string" &&
    isBookingRecurrenceStatus(candidate.recurrenceStatus)
  );
}

export function isBookingRecurrencePort(
  value: unknown,
): value is BookingRecurrencePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingRecurrencePort).createRecurrence === "function" &&
    typeof (value as BookingRecurrencePort).resolveRecurrence === "function"
  );
}
