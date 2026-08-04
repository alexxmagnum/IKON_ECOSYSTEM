/**
 * Hospitality Booking Request — formalized intent to join an available experience.
 * Bridge only: Participation → Booking Request → future hold operations.
 *
 * @see DEC-HOSPITALITY-BOOKING-BRIDGE-CONTEXT-001
 */

/** Internal booking kinds — experience intent, not tickets or till rails. */
export const BOOKING_KINDS = {
  /** Intent for a normal activity. */
  Activity: "booking.activity",
  /** Intent for an occasion. */
  Event: "booking.event",
  /** Intent for a concrete session. */
  Session: "booking.session",
  /** Internal MotanOS hospitality booking intent. */
  Internal: "booking.internal",
} as const;

export type BookingKind =
  (typeof BOOKING_KINDS)[keyof typeof BOOKING_KINDS];

export const BOOKING_KIND_VALUES = Object.values(
  BOOKING_KINDS,
) as readonly BookingKind[];

/** Booking request lifecycle status (existence labels only — no confirm runtime). */
export const BOOKING_STATUSES = {
  Draft: "draft",
  Requested: "requested",
  Pending: "pending",
  Accepted: "accepted",
  Rejected: "rejected",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export const BOOKING_STATUS_VALUES = Object.values(
  BOOKING_STATUSES,
) as readonly BookingStatus[];

/**
 * Opaque hospitality booking request — intent existence only.
 * No guest counts, tariff, seat indices, or clock-confirm fields.
 * No till, room assign, external agenda, alert, or score payloads.
 */
export type HospitalityBookingRequest = {
  /** Opaque unique booking reference. */
  bookingReference: string;
  /** Internal booking kind. */
  bookingKind: BookingKind;
  /** Booking status. */
  bookingStatus: BookingStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque schedule pointer when known. */
  scheduleReference?: string;
  /** Opaque availability pointer when known. */
  availabilityReference?: string;
  /** Opaque participation pointer when known. */
  participationReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque parent booking pointer when nested. */
  parentBookingReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future booking-bridge adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface BookingBridgePort {
  createBookingRequest(
    input: CreateBookingRequestInput,
  ): Promise<HospitalityBookingRequest>;
  resolveBookingRequest(
    booking: HospitalityBookingRequest,
  ): Promise<HospitalityBookingRequest>;
}

export type CreateBookingRequestInput = {
  bookingKind: BookingKind;
  bookingStatus?: BookingStatus;
  bookingReference?: string;
  hospitalityReference?: string;
  activityReference?: string;
  scheduleReference?: string;
  availabilityReference?: string;
  participationReference?: string;
  actorReference?: string;
  contextReference?: string;
  parentBookingReference?: string;
  metadata?: Record<string, unknown>;
};

export function isBookingKind(value: string): value is BookingKind {
  return (BOOKING_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isHospitalityBookingRequest(
  value: unknown,
): value is HospitalityBookingRequest {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "scheduleReference") &&
    optionalOpaqueOk(candidate, "availabilityReference") &&
    optionalOpaqueOk(candidate, "participationReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "parentBookingReference") &&
    typeof candidate.bookingKind === "string" &&
    isBookingKind(candidate.bookingKind) &&
    typeof candidate.bookingStatus === "string" &&
    isBookingStatus(candidate.bookingStatus)
  );
}

export function isBookingBridgePort(
  value: unknown,
): value is BookingBridgePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingBridgePort).createBookingRequest ===
      "function" &&
    typeof (value as BookingBridgePort).resolveBookingRequest ===
      "function"
  );
}
