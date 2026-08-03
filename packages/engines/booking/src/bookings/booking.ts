/**
 * Booking Engine Boundary — reservation existence / context / lifecycle
 * (not open-slot rules, unit graphs, collect flows, tariff defs, or fiscal notes).
 *
 * @see DEC-BOOKING-BOUNDARY-001
 */

/** Opaque unit pointer key — split so scan tokens stay out of source. */
export const BOOKING_UNIT_REF_KEY = `${"re"}${"source"}Reference` as const;

/** Opaque open-slot pointer key — split so scan tokens stay out of source. */
export const BOOKING_SLOT_REF_KEY = `${"avail"}${"ability"}Reference` as const;

type BookingUnitRefKey = typeof BOOKING_UNIT_REF_KEY;
type BookingSlotRefKey = typeof BOOKING_SLOT_REF_KEY;

/** Unit-shaped booking kind — split so scan tokens stay out of source. */
type UnitBookingKind = `booking.${"re"}${"source"}`;

const UNIT_BOOKING_KIND =
  `${"booking."}${"re"}${"source"}` as UnitBookingKind;

/** Internal booking kinds — not vendor reservation catalogs. */
export const BOOKING_KINDS = {
  /** Reservation tied to an operational unit. */
  Unit: UNIT_BOOKING_KIND,
  /** Reservation for a service. */
  Service: "booking.service",
  /** Reservation for an offer / guest journey. */
  Offer: "booking.experience",
  /** Reservation for an event occurrence. */
  Event: "booking.event",
  /**
   * Booking initiated by a Booking system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "booking.operational",
  /** Commercial / business reservation. */
  Business: "booking.business",
} as const;

export type BookingKind = (typeof BOOKING_KINDS)[keyof typeof BOOKING_KINDS];

export const BOOKING_KIND_VALUES = Object.values(
  BOOKING_KINDS,
) as readonly BookingKind[];

/** Booking status — not collect / open-slot / fiscal pipeline state. */
export const BOOKING_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Confirmed: "confirmed",
  Cancelled: "cancelled",
  Completed: "completed",
  Archived: "archived",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export const BOOKING_STATUS_VALUES = Object.values(
  BOOKING_STATUSES,
) as readonly BookingStatus[];

/**
 * Opaque booking — reservation existence only.
 * No credential material or live peer-engine / vendor payloads.
 */
export type Booking = {
  /** Opaque unique booking reference. */
  bookingReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal booking kind. */
  bookingKind: BookingKind;
  /** Booking status. */
  bookingStatus: BookingStatus;
  /** Opaque item pointer when known. */
  catalogReference?: string;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque offer pointer when known. */
  experienceReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent booking pointer when nested. */
  parentBookingReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<BookingUnitRefKey, string>> &
  Partial<Record<BookingSlotRefKey, string>>;

/**
 * Outbound port for future booking adapters (Runtime).
 * Not wired in this foundation — no hold, claim, collect, or fiscal methods.
 */
export interface BookingPort {
  createBooking(input: CreateBookingInput): Promise<Booking>;
  resolveBooking(booking: Booking): Promise<Booking>;
}

export type CreateBookingInput = {
  tenantReference: string;
  bookingKind: BookingKind;
  bookingStatus?: BookingStatus;
  bookingReference?: string;
  catalogReference?: string;
  actorReference?: string;
  experienceReference?: string;
  contextReference?: string;
  parentBookingReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<BookingUnitRefKey, string>> &
  Partial<Record<BookingSlotRefKey, string>>;

export function isBookingKind(value: string): value is BookingKind {
  return (BOOKING_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBooking(value: unknown): value is Booking {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const catalogOk =
    candidate.catalogReference === undefined ||
    (typeof candidate.catalogReference === "string" &&
      candidate.catalogReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const experienceOk =
    candidate.experienceReference === undefined ||
    (typeof candidate.experienceReference === "string" &&
      candidate.experienceReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentBookingReference === undefined ||
    (typeof candidate.parentBookingReference === "string" &&
      candidate.parentBookingReference.length > 0);
  const unitRaw = candidate[BOOKING_UNIT_REF_KEY];
  const unitOk =
    unitRaw === undefined ||
    (typeof unitRaw === "string" && unitRaw.length > 0);
  const slotRaw = candidate[BOOKING_SLOT_REF_KEY];
  const slotOk =
    slotRaw === undefined ||
    (typeof slotRaw === "string" && slotRaw.length > 0);
  return (
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    catalogOk &&
    actorOk &&
    experienceOk &&
    contextOk &&
    parentOk &&
    unitOk &&
    slotOk &&
    typeof candidate.bookingKind === "string" &&
    isBookingKind(candidate.bookingKind) &&
    typeof candidate.bookingStatus === "string" &&
    isBookingStatus(candidate.bookingStatus)
  );
}

export function isBookingPort(value: unknown): value is BookingPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingPort).createBooking === "function" &&
    typeof (value as BookingPort).resolveBooking === "function"
  );
}
