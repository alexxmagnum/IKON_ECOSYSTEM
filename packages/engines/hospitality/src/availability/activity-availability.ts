/**
 * Hospitality Activity Availability — whether participation is currently possible.
 * Separates Activity / Schedule / Capacity / Availability / Participation.
 *
 * @see DEC-HOSPITALITY-ACTIVITY-AVAILABILITY-CONTEXT-001
 */

/** Internal availability kinds — experience openness, not global slot engines. */
export const AVAILABILITY_KINDS = {
  /** General activity openness. */
  Activity: "availability.activity",
  /** Session-scoped openness. */
  Session: "availability.session",
  /** Occasion-scoped openness. */
  Event: "availability.event",
  /** Internal MotanOS hospitality availability. */
  Internal: "availability.internal",
} as const;

export type AvailabilityKind =
  (typeof AVAILABILITY_KINDS)[keyof typeof AVAILABILITY_KINDS];

export const AVAILABILITY_KIND_VALUES = Object.values(
  AVAILABILITY_KINDS,
) as readonly AvailabilityKind[];

/** Availability lifecycle status (existence labels only — no consume runtime). */
export const AVAILABILITY_STATUSES = {
  Draft: "draft",
  Available: "available",
  Limited: "limited",
  Unavailable: "unavailable",
  Closed: "closed",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUSES)[keyof typeof AVAILABILITY_STATUSES];

export const AVAILABILITY_STATUS_VALUES = Object.values(
  AVAILABILITY_STATUSES,
) as readonly AvailabilityStatus[];

/**
 * Opaque hospitality activity availability — openness existence only.
 * Slot magnitudes live behind opaque refs (no bare numeric seat fields).
 * No seat hold, till, waitlist engine, door scan, alert, or score payloads.
 */
export type HospitalityActivityAvailability = {
  /** Opaque unique availability reference. */
  availabilityReference: string;
  /** Internal availability kind. */
  availabilityKind: AvailabilityKind;
  /** Availability status. */
  availabilityStatus: AvailabilityStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque schedule pointer when known. */
  scheduleReference?: string;
  /** Opaque capacity pointer when known. */
  capacityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque openness-state pointer when known. */
  stateReference?: string;
  /** Opaque time-window pointer when known. */
  windowReference?: string;
  /** Opaque parent availability pointer when nested. */
  parentAvailabilityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future activity-availability adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface ActivityAvailabilityPort {
  createActivityAvailability(
    input: CreateActivityAvailabilityInput,
  ): Promise<HospitalityActivityAvailability>;
  resolveActivityAvailability(
    availability: HospitalityActivityAvailability,
  ): Promise<HospitalityActivityAvailability>;
}

export type CreateActivityAvailabilityInput = {
  availabilityKind: AvailabilityKind;
  availabilityStatus?: AvailabilityStatus;
  availabilityReference?: string;
  hospitalityReference?: string;
  activityReference?: string;
  scheduleReference?: string;
  capacityReference?: string;
  contextReference?: string;
  stateReference?: string;
  windowReference?: string;
  parentAvailabilityReference?: string;
  metadata?: Record<string, unknown>;
};

export function isAvailabilityKind(value: string): value is AvailabilityKind {
  return (AVAILABILITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isAvailabilityStatus(
  value: string,
): value is AvailabilityStatus {
  return (AVAILABILITY_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityActivityAvailability(
  value: unknown,
): value is HospitalityActivityAvailability {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.availabilityReference === "string" &&
    candidate.availabilityReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "scheduleReference") &&
    optionalOpaqueOk(candidate, "capacityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "stateReference") &&
    optionalOpaqueOk(candidate, "windowReference") &&
    optionalOpaqueOk(candidate, "parentAvailabilityReference") &&
    typeof candidate.availabilityKind === "string" &&
    isAvailabilityKind(candidate.availabilityKind) &&
    typeof candidate.availabilityStatus === "string" &&
    isAvailabilityStatus(candidate.availabilityStatus)
  );
}

export function isActivityAvailabilityPort(
  value: unknown,
): value is ActivityAvailabilityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ActivityAvailabilityPort).createActivityAvailability ===
      "function" &&
    typeof (value as ActivityAvailabilityPort).resolveActivityAvailability ===
      "function"
  );
}
