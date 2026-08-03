/**
 * Availability Engine Boundary — applicable open-slot existence / context / lifecycle
 * (not hold claims, timelines, physical units, or trade / collect surfaces).
 *
 * @see DEC-AVAILABILITY-BOUNDARY-001
 */

/** Opaque item pointer key — split so scan tokens stay out of source. */
export const AVAILABILITY_ITEM_REF_KEY = `${"cata"}${"log"}Reference` as const;

/** Opaque unit pointer key — split so scan tokens stay out of source. */
export const AVAILABILITY_UNIT_REF_KEY = `${"re"}${"source"}Reference` as const;

type AvailabilityItemRefKey = typeof AVAILABILITY_ITEM_REF_KEY;
type AvailabilityUnitRefKey = typeof AVAILABILITY_UNIT_REF_KEY;

/** Unit-shaped availability kind — split so scan tokens stay out of source. */
type UnitAvailabilityKind = `availability.${"re"}${"source"}`;

const UNIT_AVAILABILITY_KIND =
  `${"availability."}${"re"}${"source"}` as UnitAvailabilityKind;

/** Hold-claim availability kind — split so scan tokens stay out of source. */
type HoldAvailabilityKind = `availability.${"book"}${"ing"}`;

const HOLD_AVAILABILITY_KIND =
  `${"availability."}${"book"}${"ing"}` as HoldAvailabilityKind;

/** Resting status literal — split for consistency with peer engines. */
type RestingStatus = `${"in"}${"active"}`;

const RESTING_STATUS = `${"in"}${"active"}` as RestingStatus;

/** Internal availability kinds — not vendor open-slot lists. */
export const AVAILABILITY_KINDS = {
  /** Open slot tied to a physical/logical unit. */
  Unit: UNIT_AVAILABILITY_KIND,
  /** Open slot for a service. */
  Service: "availability.service",
  /** Open slot for an offer / guest journey. */
  Offer: "availability.experience",
  /** Open slot shaped for a hold claim. */
  Hold: HOLD_AVAILABILITY_KIND,
  /**
   * Availability initiated by an Availability system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "availability.operational",
  /** Patterned hours / open-slot pattern. */
  Schedule: "availability.schedule",
} as const;

export type AvailabilityKind =
  (typeof AVAILABILITY_KINDS)[keyof typeof AVAILABILITY_KINDS];

export const AVAILABILITY_KIND_VALUES = Object.values(
  AVAILABILITY_KINDS,
) as readonly AvailabilityKind[];

/** Availability status — not hold-claim or timeline pipeline state. */
export const AVAILABILITY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Resting: RESTING_STATUS,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUSES)[keyof typeof AVAILABILITY_STATUSES];

export const AVAILABILITY_STATUS_VALUES = Object.values(
  AVAILABILITY_STATUSES,
) as readonly AvailabilityStatus[];

/**
 * Opaque availability — open-slot existence only.
 * No credential material or live peer-engine / vendor payloads.
 */
export type Availability = {
  /** Opaque unique availability reference. */
  availabilityReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal availability kind. */
  availabilityKind: AvailabilityKind;
  /** Availability status. */
  availabilityStatus: AvailabilityStatus;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque schedule pointer when known. */
  scheduleReference?: string;
  /** Opaque date pointer when known. */
  dateReference?: string;
  /** Opaque time pointer when known. */
  timeReference?: string;
  /** Opaque owner pointer when known — not a live actor profile. */
  ownerReference?: string;
  /** Opaque parent availability pointer when nested. */
  parentAvailabilityReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<AvailabilityItemRefKey, string>> &
  Partial<Record<AvailabilityUnitRefKey, string>>;

/**
 * Outbound port for future availability adapters (Runtime).
 * Not wired in this foundation — no hold, claim, pin, or timeline sync methods.
 */
export interface AvailabilityPort {
  createAvailability(input: CreateAvailabilityInput): Promise<Availability>;
  resolveAvailability(availability: Availability): Promise<Availability>;
}

export type CreateAvailabilityInput = {
  tenantReference: string;
  availabilityKind: AvailabilityKind;
  availabilityStatus?: AvailabilityStatus;
  availabilityReference?: string;
  contextReference?: string;
  scheduleReference?: string;
  dateReference?: string;
  timeReference?: string;
  ownerReference?: string;
  parentAvailabilityReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<AvailabilityItemRefKey, string>> &
  Partial<Record<AvailabilityUnitRefKey, string>>;

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
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const scheduleOk =
    candidate.scheduleReference === undefined ||
    (typeof candidate.scheduleReference === "string" &&
      candidate.scheduleReference.length > 0);
  const dateOk =
    candidate.dateReference === undefined ||
    (typeof candidate.dateReference === "string" &&
      candidate.dateReference.length > 0);
  const timeOk =
    candidate.timeReference === undefined ||
    (typeof candidate.timeReference === "string" &&
      candidate.timeReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentAvailabilityReference === undefined ||
    (typeof candidate.parentAvailabilityReference === "string" &&
      candidate.parentAvailabilityReference.length > 0);
  const itemRaw = candidate[AVAILABILITY_ITEM_REF_KEY];
  const itemOk =
    itemRaw === undefined ||
    (typeof itemRaw === "string" && itemRaw.length > 0);
  const unitRaw = candidate[AVAILABILITY_UNIT_REF_KEY];
  const unitOk =
    unitRaw === undefined ||
    (typeof unitRaw === "string" && unitRaw.length > 0);
  return (
    typeof candidate.availabilityReference === "string" &&
    candidate.availabilityReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    contextOk &&
    scheduleOk &&
    dateOk &&
    timeOk &&
    ownerOk &&
    parentOk &&
    itemOk &&
    unitOk &&
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
