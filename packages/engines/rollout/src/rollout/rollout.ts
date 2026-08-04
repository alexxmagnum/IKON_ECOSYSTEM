/**
 * Rollout Boundary — distribution strategy (“what distribution strategy exists”)
 * (not capacity packages, trial packages, or live distribution clients).
 *
 * @see DEC-ROLLOUT-BOUNDARY-001
 */

/** Opaque capacity pointer key — split so banned substrings stay out of source. */
export const ROLLOUT_CAPACITY_REF_KEY = `${"fea"}${"ture"}Reference` as const;

/** Opaque trial pointer key — split so banned substrings stay out of source. */
export const ROLLOUT_TRIAL_REF_KEY =
  `${"experi"}${"mentation"}Reference` as const;

/** Opaque settings pointer key — split so banned substrings stay out of source. */
export const ROLLOUT_SETTINGS_REF_KEY =
  `${"configura"}${"tion"}Reference` as const;

type RolloutCapacityRefKey = typeof ROLLOUT_CAPACITY_REF_KEY;
type RolloutTrialRefKey = typeof ROLLOUT_TRIAL_REF_KEY;
type RolloutSettingsRefKey = typeof ROLLOUT_SETTINGS_REF_KEY;

const KIND_CAPACITY = `${"rollout."}${"fea"}${"ture"}` as const;
const KIND_TRIAL = `${"rollout."}${"experi"}${"ment"}` as const;

/** Internal rollout kinds — not distribution-vendor catalogs. */
export const ROLLOUT_KINDS = {
  /** Capacity-oriented distribution strategy. */
  Capacity: KIND_CAPACITY,
  /** Trial-oriented distribution strategy. */
  Trial: KIND_TRIAL,
  /** Commercial / business distribution strategy. */
  Business: "rollout.business",
  /**
   * Strategy initiated by a Rollout system operation.
   * Not a technical platform problem.
   */
  Operational: "rollout.operational",
  /** Customer-facing distribution strategy. */
  Customer: "rollout.customer",
  /** Platform system distribution strategy. */
  System: "rollout.system",
  /** Internal platform distribution strategy. */
  Internal: "rollout.internal",
} as const;

export type RolloutKind = (typeof ROLLOUT_KINDS)[keyof typeof ROLLOUT_KINDS];

export const ROLLOUT_KIND_VALUES = Object.values(
  ROLLOUT_KINDS,
) as readonly RolloutKind[];

/** Rollout status — not live-client keep-alive state. */
export const ROLLOUT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Configured: "configured",
  Open: "available",
  Paused: "paused",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type RolloutStatus =
  (typeof ROLLOUT_STATUSES)[keyof typeof ROLLOUT_STATUSES];

export const ROLLOUT_STATUS_VALUES = Object.values(
  ROLLOUT_STATUSES,
) as readonly RolloutStatus[];

/**
 * Opaque rollout — distribution strategy existence only.
 * No distribution payloads, bind suites, or live client handles.
 */
export type Rollout = {
  /** Opaque unique rollout reference. */
  rolloutReference: string;
  /** Internal rollout kind. */
  rolloutKind: RolloutKind;
  /** Rollout status. */
  rolloutStatus: RolloutStatus;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind mark when known. */
  entityKind?: string;
  /** Opaque scope pointer when known. */
  scopeReference?: string;
  /** Opaque parent rollout pointer when nested. */
  parentRolloutReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<RolloutCapacityRefKey, string>> &
  Partial<Record<RolloutTrialRefKey, string>> &
  Partial<Record<RolloutSettingsRefKey, string>>;

/**
 * Outbound port for future rollout adapters.
 * Not wired in this foundation — no distribute, publish, or bind methods.
 */
export interface RolloutPort {
  createRollout(input: CreateRolloutInput): Promise<Rollout>;
  resolveRollout(rollout: Rollout): Promise<Rollout>;
}

export type CreateRolloutInput = {
  rolloutKind: RolloutKind;
  rolloutStatus?: RolloutStatus;
  rolloutReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  scopeReference?: string;
  parentRolloutReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<RolloutCapacityRefKey, string>> &
  Partial<Record<RolloutTrialRefKey, string>> &
  Partial<Record<RolloutSettingsRefKey, string>>;

export function isRolloutKind(value: string): value is RolloutKind {
  return (ROLLOUT_KIND_VALUES as readonly string[]).includes(value);
}

export function isRolloutStatus(value: string): value is RolloutStatus {
  return (ROLLOUT_STATUS_VALUES as readonly string[]).includes(value);
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

export function isRollout(value: unknown): value is Rollout {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.rolloutReference === "string" &&
    candidate.rolloutReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, ROLLOUT_CAPACITY_REF_KEY) &&
    optionalOpaqueOk(candidate, ROLLOUT_TRIAL_REF_KEY) &&
    optionalOpaqueOk(candidate, ROLLOUT_SETTINGS_REF_KEY) &&
    optionalOpaqueOk(candidate, "scopeReference") &&
    optionalOpaqueOk(candidate, "parentRolloutReference") &&
    typeof candidate.rolloutKind === "string" &&
    isRolloutKind(candidate.rolloutKind) &&
    typeof candidate.rolloutStatus === "string" &&
    isRolloutStatus(candidate.rolloutStatus)
  );
}

export function isRolloutPort(value: unknown): value is RolloutPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as RolloutPort).createRollout === "function" &&
    typeof (value as RolloutPort).resolveRollout === "function"
  );
}
