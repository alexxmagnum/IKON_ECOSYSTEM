/**
 * Availability Engine Boundary — temporal usability / capacity rules
 * (not usage intents, event timelines, physical assets, or commerce).
 *
 * Distinct from any MotanOS usage-engine policy boundary.
 *
 * @see DEC-AVAILABILITY-BOUNDARY-001
 * @see DEC-RESOURCE-BOUNDARY-001
 */

/** Internal availability kinds — not timeline events or asset SKUs. */
export const AVAILABILITY_KINDS = {
  /** Recurring weekly / patterned hours. */
  Schedule: "availability.schedule",
  /** Concrete open interval. */
  Window: "availability.window",
  /** Temporal capacity rule. */
  Capacity: "availability.capacity",
  /**
   * Availability initiated by an Availability system operation.
   * Not a technical infrastructure error.
   */
  Operational: "availability.operational",
} as const;

export type AvailabilityKind =
  (typeof AVAILABILITY_KINDS)[keyof typeof AVAILABILITY_KINDS];

export const AVAILABILITY_KIND_VALUES = Object.values(
  AVAILABILITY_KINDS,
) as readonly AvailabilityKind[];

/** Availability rule status — not usage-intent or timeline state. */
export const AVAILABILITY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Expired: "expired",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUSES)[keyof typeof AVAILABILITY_STATUSES];

export const AVAILABILITY_STATUS_VALUES = Object.values(
  AVAILABILITY_STATUSES,
) as readonly AvailabilityStatus[];

/**
 * Opaque availability rule — when something may be used.
 * No secrets, credential material, or commerce fields.
 */
export interface Availability {
  /** Opaque unique availability reference. */
  availabilityReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal availability kind. */
  availabilityKind: AvailabilityKind;
  /** Availability rule status. */
  availabilityStatus: AvailabilityStatus;
  /** Opaque resource pointer — not a live asset graph. */
  resourceReference?: string;
  /** Opaque experience pointer — not a live offering graph. */
  experienceReference?: string;
  /** Opaque schedule pointer — not a live timeline query. */
  scheduleReference?: string;
  /** Opaque owner when known — not an identity profile. */
  ownerReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future availability adapters (Runtime).
 * Not wired in this foundation — no lookups, generation, or blocking.
 */
export interface AvailabilityPort {
  createAvailability(input: CreateAvailabilityInput): Promise<Availability>;
  resolveAvailability(availability: Availability): Promise<Availability>;
}

export interface CreateAvailabilityInput {
  tenantReference: string;
  availabilityKind: AvailabilityKind;
  availabilityStatus?: AvailabilityStatus;
  availabilityReference?: string;
  resourceReference?: string;
  experienceReference?: string;
  scheduleReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
}

export function isAvailabilityKind(value: string): value is AvailabilityKind {
  return (AVAILABILITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isAvailabilityStatus(
  value: string,
): value is AvailabilityStatus {
  return (AVAILABILITY_STATUS_VALUES as readonly string[]).includes(value);
}

export function isAvailability(value: unknown): value is Availability {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const resourceOk =
    candidate.resourceReference === undefined ||
    (typeof candidate.resourceReference === "string" &&
      candidate.resourceReference.length > 0);
  const experienceOk =
    candidate.experienceReference === undefined ||
    (typeof candidate.experienceReference === "string" &&
      candidate.experienceReference.length > 0);
  const scheduleOk =
    candidate.scheduleReference === undefined ||
    (typeof candidate.scheduleReference === "string" &&
      candidate.scheduleReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  return (
    typeof candidate.availabilityReference === "string" &&
    candidate.availabilityReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    resourceOk &&
    experienceOk &&
    scheduleOk &&
    ownerOk &&
    typeof candidate.availabilityKind === "string" &&
    isAvailabilityKind(candidate.availabilityKind) &&
    typeof candidate.availabilityStatus === "string" &&
    isAvailabilityStatus(candidate.availabilityStatus)
  );
}

export function isAvailabilityPort(value: unknown): value is AvailabilityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as AvailabilityPort).createAvailability === "function" &&
    typeof (value as AvailabilityPort).resolveAvailability === "function"
  );
}
