/**
 * Hospitality Reservation Runtime — accepted participation commitment.
 * Bridge only: Booking Request → Reservation Runtime → future visit ops.
 *
 * @see DEC-HOSPITALITY-RESERVATION-RUNTIME-CONTEXT-001
 */

/** Internal reservation-runtime kinds — experience holds, not tickets or till rails. */
export const RESERVATION_RUNTIME_KINDS = {
  /** Hold for a normal activity. */
  Activity: "reservation.activity",
  /** Hold for an occasion. */
  Event: "reservation.event",
  /** Hold for a concrete session. */
  Session: "reservation.session",
  /** Internal MotanOS hospitality experience hold. */
  Internal: "reservation.internal",
} as const;

export type ReservationRuntimeKind =
  (typeof RESERVATION_RUNTIME_KINDS)[keyof typeof RESERVATION_RUNTIME_KINDS];

export const RESERVATION_RUNTIME_KIND_VALUES = Object.values(
  RESERVATION_RUNTIME_KINDS,
) as readonly ReservationRuntimeKind[];

/** Reservation-runtime lifecycle status (existence labels only — no visit ops). */
export const RESERVATION_RUNTIME_STATUSES = {
  Draft: "draft",
  Requested: "requested",
  Confirmed: "confirmed",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
  Expired: "expired",
  Archived: "archived",
} as const;

export type ReservationRuntimeStatus =
  (typeof RESERVATION_RUNTIME_STATUSES)[keyof typeof RESERVATION_RUNTIME_STATUSES];

export const RESERVATION_RUNTIME_STATUS_VALUES = Object.values(
  RESERVATION_RUNTIME_STATUSES,
) as readonly ReservationRuntimeStatus[];

/**
 * Opaque hospitality reservation runtime — commitment existence only.
 * No tariff figures, till pointers, room indices, seat indices, or door-scan clocks.
 * No till, room bind, ticket rails, alert, or score payloads.
 */
export type HospitalityReservationRuntime = {
  /** Opaque unique reservation reference. */
  reservationReference: string;
  /** Internal reservation-runtime kind. */
  reservationKind: ReservationRuntimeKind;
  /** Reservation-runtime status. */
  reservationStatus: ReservationRuntimeStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque schedule pointer when known. */
  scheduleReference?: string;
  /** Opaque booking-request pointer when known. */
  bookingReference?: string;
  /** Opaque participation pointer when known. */
  participationReference?: string;
  /** Opaque availability pointer when known. */
  availabilityReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque guest pointer when known. */
  guestReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque parent reservation pointer when nested. */
  parentReservationReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future reservation-runtime adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface ReservationRuntimePort {
  createReservation(
    input: CreateReservationRuntimeInput,
  ): Promise<HospitalityReservationRuntime>;
  resolveReservation(
    reservation: HospitalityReservationRuntime,
  ): Promise<HospitalityReservationRuntime>;
}

export type CreateReservationRuntimeInput = {
  reservationKind: ReservationRuntimeKind;
  reservationStatus?: ReservationRuntimeStatus;
  reservationReference?: string;
  hospitalityReference?: string;
  activityReference?: string;
  scheduleReference?: string;
  bookingReference?: string;
  participationReference?: string;
  availabilityReference?: string;
  actorReference?: string;
  guestReference?: string;
  contextReference?: string;
  parentReservationReference?: string;
  metadata?: Record<string, unknown>;
};

export function isReservationRuntimeKind(
  value: string,
): value is ReservationRuntimeKind {
  return (RESERVATION_RUNTIME_KIND_VALUES as readonly string[]).includes(
    value,
  );
}

export function isReservationRuntimeStatus(
  value: string,
): value is ReservationRuntimeStatus {
  return (RESERVATION_RUNTIME_STATUS_VALUES as readonly string[]).includes(
    value,
  );
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

export function isHospitalityReservationRuntime(
  value: unknown,
): value is HospitalityReservationRuntime {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.reservationReference === "string" &&
    candidate.reservationReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "scheduleReference") &&
    optionalOpaqueOk(candidate, "bookingReference") &&
    optionalOpaqueOk(candidate, "participationReference") &&
    optionalOpaqueOk(candidate, "availabilityReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "guestReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "parentReservationReference") &&
    typeof candidate.reservationKind === "string" &&
    isReservationRuntimeKind(candidate.reservationKind) &&
    typeof candidate.reservationStatus === "string" &&
    isReservationRuntimeStatus(candidate.reservationStatus)
  );
}

export function isReservationRuntimePort(
  value: unknown,
): value is ReservationRuntimePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ReservationRuntimePort).createReservation ===
      "function" &&
    typeof (value as ReservationRuntimePort).resolveReservation ===
      "function"
  );
}
