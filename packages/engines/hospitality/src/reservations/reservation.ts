/**
 * Hospitality Reservation — scheduled visit intent within a hospitality business.
 * Smart Table OS capacity (existence only): Customer → Reservation → Table → Order.
 *
 * @see DEC-HOSPITALITY-RESERVATION-CONTEXT-001
 */

/** Internal reservation kinds — visit intents, not calendar/booking engines. */
export const RESERVATION_KINDS = {
  /** Dining-room reservation. */
  Dining: "reservation.dining",
  /** Bar reservation. */
  Bar: "reservation.bar",
  /** Private dining reservation. */
  Private: "reservation.private",
  /** Event / group reservation. */
  Event: "reservation.event",
  /** Club reservation. */
  Club: "reservation.club",
  /** Internal MotanOS hospitality reservation. */
  Internal: "reservation.internal",
} as const;

export type ReservationKind =
  (typeof RESERVATION_KINDS)[keyof typeof RESERVATION_KINDS];

export const RESERVATION_KIND_VALUES = Object.values(
  RESERVATION_KINDS,
) as readonly ReservationKind[];

/** Reservation lifecycle status (existence labels only). */
export const RESERVATION_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Confirmed: "confirmed",
  Arrived: "arrived",
  Completed: "completed",
  Cancelled: "cancelled",
  NoShow: "no_show",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUSES)[keyof typeof RESERVATION_STATUSES];

export const RESERVATION_STATUS_VALUES = Object.values(
  RESERVATION_STATUSES,
) as readonly ReservationStatus[];

/**
 * Opaque hospitality reservation — visit-intent existence only.
 * No calendar, availability, auto table bind, reminders, or payment payloads.
 */
export type HospitalityReservation = {
  /** Opaque unique reservation reference. */
  reservationReference: string;
  /** Internal reservation kind. */
  reservationKind: ReservationKind;
  /** Reservation status. */
  reservationStatus: ReservationStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque table pointer when known (no auto-bind). */
  tableReference?: string;
  /** Opaque customer pointer when known (no Customer entity here). */
  customerReference?: string;
  /** Opaque guest pointer when known. */
  guestReference?: string;
  /** Opaque date pointer when known (no Date engine here). */
  dateReference?: string;
  /** Opaque time pointer when known (no Calendar engine here). */
  timeReference?: string;
  /** Opaque party-size pointer when known (no capacity rules here). */
  partySizeReference?: string;
  /** Opaque parent reservation pointer when nested. */
  parentReservationReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future reservation adapters.
 * Not wired in this foundation — no confirm / reminder / calendar methods.
 */
export interface ReservationPort {
  createReservation(
    input: CreateReservationInput,
  ): Promise<HospitalityReservation>;
  resolveReservation(
    reservation: HospitalityReservation,
  ): Promise<HospitalityReservation>;
}

export type CreateReservationInput = {
  reservationKind: ReservationKind;
  reservationStatus?: ReservationStatus;
  reservationReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  tableReference?: string;
  customerReference?: string;
  guestReference?: string;
  dateReference?: string;
  timeReference?: string;
  partySizeReference?: string;
  parentReservationReference?: string;
  metadata?: Record<string, unknown>;
};

export function isReservationKind(value: string): value is ReservationKind {
  return (RESERVATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isReservationStatus(
  value: string,
): value is ReservationStatus {
  return (RESERVATION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityReservation(
  value: unknown,
): value is HospitalityReservation {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.reservationReference === "string" &&
    candidate.reservationReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "tableReference") &&
    optionalOpaqueOk(candidate, "customerReference") &&
    optionalOpaqueOk(candidate, "guestReference") &&
    optionalOpaqueOk(candidate, "dateReference") &&
    optionalOpaqueOk(candidate, "timeReference") &&
    optionalOpaqueOk(candidate, "partySizeReference") &&
    optionalOpaqueOk(candidate, "parentReservationReference") &&
    typeof candidate.reservationKind === "string" &&
    isReservationKind(candidate.reservationKind) &&
    typeof candidate.reservationStatus === "string" &&
    isReservationStatus(candidate.reservationStatus)
  );
}

export function isReservationPort(value: unknown): value is ReservationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ReservationPort).createReservation === "function" &&
    typeof (value as ReservationPort).resolveReservation === "function"
  );
}
