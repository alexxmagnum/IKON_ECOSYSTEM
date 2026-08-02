/**
 * Booking Availability Policy Boundary — capacity/availability intent (not a calendar SDK).
 * Domain rules validate booking transitions; this boundary evaluates availability policy.
 *
 * Distinct from `domain/availability` pure overlap helpers and from BookingQueryService reads.
 *
 * @see DEC-BOOKING-AVAILABILITY-001
 */

/** Internal availability check kinds — not external calendar event types. */
export const BOOKING_AVAILABILITY_KINDS = {
  ResourceCheck: "booking.resource_check",
  SlotCheck: "booking.slot_check",
  CapacityCheck: "booking.capacity_check",
} as const;

export type BookingAvailabilityKind =
  (typeof BOOKING_AVAILABILITY_KINDS)[keyof typeof BOOKING_AVAILABILITY_KINDS];

export const BOOKING_AVAILABILITY_KIND_VALUES = Object.values(
  BOOKING_AVAILABILITY_KINDS,
) as readonly BookingAvailabilityKind[];

/**
 * Opaque request to evaluate Booking availability policy.
 * No calendar OAuth tokens, private calendar payloads, or emails.
 */
export interface BookingAvailabilityRequest {
  /** Opaque unique availability evaluation reference. */
  availabilityReference: string;
  /** Explicit tenant scope. */
  tenantReference: string;
  /** Opaque resource under evaluation. */
  resourceReference: string;
  /** Optional booking related to the check (e.g. reschedule exclude). */
  bookingReference?: string;
  /** Opaque actor that requested the check, when known. */
  actorReference?: string;
  /** Internal availability kind. */
  availabilityKind: BookingAvailabilityKind;
  /** Range start (ISO-8601) — context only, not a persisted slot model. */
  startAt: string;
  /** Range end (ISO-8601). */
  endAt: string;
  /** Controlled optional metadata — never secrets or calendar credentials. */
  metadata?: Record<string, unknown>;
}

/**
 * Policy decision for an availability evaluation.
 * Not a Domain Event and not a Query result aggregate dump.
 */
export interface BookingAvailabilityDecision {
  available: boolean;
  reason?: string;
}

/**
 * Availability Policy — answers “is capacity available under this policy?”
 * Does not replace Domain Rules or BookingQueryService.
 */
export interface BookingAvailabilityPolicy {
  evaluate(
    request: BookingAvailabilityRequest,
  ): Promise<BookingAvailabilityDecision>;
}

/**
 * Outbound port for future capacity providers (Runtime adapters).
 * Not wired in this foundation — distinct from calendar sync Integration port.
 */
export interface BookingAvailabilityPort {
  checkAvailability(
    request: BookingAvailabilityRequest,
  ): Promise<BookingAvailabilityDecision>;
}

export interface CreateBookingAvailabilityRequestInput {
  tenantReference: string;
  resourceReference: string;
  availabilityKind: BookingAvailabilityKind;
  startAt: string;
  endAt: string;
  bookingReference?: string;
  actorReference?: string;
  availabilityReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingAvailabilityKind(
  value: string,
): value is BookingAvailabilityKind {
  return (BOOKING_AVAILABILITY_KIND_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingAvailabilityRequest(
  value: unknown,
): value is BookingAvailabilityRequest {
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
  return (
    typeof candidate.availabilityReference === "string" &&
    candidate.availabilityReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.resourceReference === "string" &&
    candidate.resourceReference.length > 0 &&
    bookingOk &&
    actorOk &&
    typeof candidate.availabilityKind === "string" &&
    isBookingAvailabilityKind(candidate.availabilityKind) &&
    typeof candidate.startAt === "string" &&
    candidate.startAt.length > 0 &&
    typeof candidate.endAt === "string" &&
    candidate.endAt.length > 0
  );
}

export function isBookingAvailabilityPort(
  value: unknown,
): value is BookingAvailabilityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingAvailabilityPort).checkAvailability === "function"
  );
}
