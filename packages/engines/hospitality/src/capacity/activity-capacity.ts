/**
 * Hospitality Activity Capacity — how many people a scheduled activity can admit.
 * Separates Activity (what), Schedule (when), Capacity (how many), Participation (who).
 *
 * @see DEC-HOSPITALITY-ACTIVITY-CAPACITY-CONTEXT-001
 */

/** Internal capacity kinds — experience limits, not stock or global slots. */
export const CAPACITY_KINDS = {
  /** Normal activity limit. */
  Activity: "capacity.activity",
  /** Occasion-oriented limit. */
  Event: "capacity.event",
  /** Session-oriented limit. */
  Session: "capacity.session",
  /** Internal MotanOS hospitality capacity. */
  Internal: "capacity.internal",
} as const;

export type CapacityKind =
  (typeof CAPACITY_KINDS)[keyof typeof CAPACITY_KINDS];

export const CAPACITY_KIND_VALUES = Object.values(
  CAPACITY_KINDS,
) as readonly CapacityKind[];

/** Capacity lifecycle status (existence labels only — no fill runtime). */
export const CAPACITY_STATUSES = {
  Draft: "draft",
  Configured: "configured",
  Available: "available",
  Full: "full",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CapacityStatus =
  (typeof CAPACITY_STATUSES)[keyof typeof CAPACITY_STATUSES];

export const CAPACITY_STATUS_VALUES = Object.values(
  CAPACITY_STATUSES,
) as readonly CapacityStatus[];

/**
 * Opaque hospitality activity capacity — limit configuration existence only.
 * Upper/lower bounds live behind opaque refs (no bare numeric seat fields).
 * No seat hold, till, waitlist engine, door scan, alert, or score payloads.
 */
export type HospitalityActivityCapacity = {
  /** Opaque unique capacity reference. */
  capacityReference: string;
  /** Internal capacity kind. */
  capacityKind: CapacityKind;
  /** Capacity status. */
  capacityStatus: CapacityStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque schedule pointer when known. */
  scheduleReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque upper-bound magnitude pointer when known. */
  limitReference?: string;
  /** Opaque lower-bound magnitude pointer when known. */
  minimumReference?: string;
  /** Opaque parent capacity pointer when nested. */
  parentCapacityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future activity-capacity adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface ActivityCapacityPort {
  createActivityCapacity(
    input: CreateActivityCapacityInput,
  ): Promise<HospitalityActivityCapacity>;
  resolveActivityCapacity(
    capacity: HospitalityActivityCapacity,
  ): Promise<HospitalityActivityCapacity>;
}

export type CreateActivityCapacityInput = {
  capacityKind: CapacityKind;
  capacityStatus?: CapacityStatus;
  capacityReference?: string;
  hospitalityReference?: string;
  activityReference?: string;
  scheduleReference?: string;
  contextReference?: string;
  limitReference?: string;
  minimumReference?: string;
  parentCapacityReference?: string;
  metadata?: Record<string, unknown>;
};

export function isCapacityKind(value: string): value is CapacityKind {
  return (CAPACITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isCapacityStatus(value: string): value is CapacityStatus {
  return (CAPACITY_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityActivityCapacity(
  value: unknown,
): value is HospitalityActivityCapacity {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.capacityReference === "string" &&
    candidate.capacityReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "scheduleReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "limitReference") &&
    optionalOpaqueOk(candidate, "minimumReference") &&
    optionalOpaqueOk(candidate, "parentCapacityReference") &&
    typeof candidate.capacityKind === "string" &&
    isCapacityKind(candidate.capacityKind) &&
    typeof candidate.capacityStatus === "string" &&
    isCapacityStatus(candidate.capacityStatus)
  );
}

export function isActivityCapacityPort(
  value: unknown,
): value is ActivityCapacityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ActivityCapacityPort).createActivityCapacity ===
      "function" &&
    typeof (value as ActivityCapacityPort).resolveActivityCapacity ===
      "function"
  );
}
