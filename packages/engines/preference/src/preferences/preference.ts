/**
 * Preference Engine Boundary — declarative preference existence / context
 * (not suggestion engines, signal packages, actor profiles, or compute vendors).
 *
 * @see DEC-PREFERENCE-BOUNDARY-001
 */

/** Internal preference kinds — not vendor preference catalogs. */
export const PREFERENCE_KINDS = {
  /** Preference scoped to an actor. */
  User: "preference.user",
  /** Preference scoped to a tenant. */
  Tenant: "preference.tenant",
  /**
   * Preference initiated by a Preference system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "preference.operational",
  /** Preference scoped to an experience context. */
  Experience: "preference.experience",
  /** Preference about communication channels. */
  Communication: "preference.communication",
  /** Commercial preference. */
  Business: "preference.business",
} as const;

export type PreferenceKind =
  (typeof PREFERENCE_KINDS)[keyof typeof PREFERENCE_KINDS];

export const PREFERENCE_KIND_VALUES = Object.values(
  PREFERENCE_KINDS,
) as readonly PreferenceKind[];

/** Preference status — not suggestion or learning pipeline state. */
export const PREFERENCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type PreferenceStatus =
  (typeof PREFERENCE_STATUSES)[keyof typeof PREFERENCE_STATUSES];

export const PREFERENCE_STATUS_VALUES = Object.values(
  PREFERENCE_STATUSES,
) as readonly PreferenceStatus[];

/**
 * Opaque preference — declared preference existence only.
 * No credential material or live vendor payloads.
 */
export interface Preference {
  /** Opaque unique preference reference. */
  preferenceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal preference kind. */
  preferenceKind: PreferenceKind;
  /** Preference status. */
  preferenceStatus: PreferenceStatus;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque category pointer when known. */
  categoryReference?: string;
  /** Opaque value pointer when known. */
  valueReference?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future preference adapters (Runtime).
 * Not wired in this foundation — no learn, infer, suggest, or forecast methods.
 */
export interface PreferencePort {
  createPreference(input: CreatePreferenceInput): Promise<Preference>;
  resolvePreference(preference: Preference): Promise<Preference>;
}

export interface CreatePreferenceInput {
  tenantReference: string;
  preferenceKind: PreferenceKind;
  preferenceStatus?: PreferenceStatus;
  preferenceReference?: string;
  actorReference?: string;
  contextReference?: string;
  categoryReference?: string;
  valueReference?: string;
  sourceReference?: string;
  metadata?: Record<string, unknown>;
}

export function isPreferenceKind(value: string): value is PreferenceKind {
  return (PREFERENCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isPreferenceStatus(value: string): value is PreferenceStatus {
  return (PREFERENCE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isPreference(value: unknown): value is Preference {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const categoryOk =
    candidate.categoryReference === undefined ||
    (typeof candidate.categoryReference === "string" &&
      candidate.categoryReference.length > 0);
  const valueOk =
    candidate.valueReference === undefined ||
    (typeof candidate.valueReference === "string" &&
      candidate.valueReference.length > 0);
  const sourceOk =
    candidate.sourceReference === undefined ||
    (typeof candidate.sourceReference === "string" &&
      candidate.sourceReference.length > 0);
  return (
    typeof candidate.preferenceReference === "string" &&
    candidate.preferenceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    contextOk &&
    categoryOk &&
    valueOk &&
    sourceOk &&
    typeof candidate.preferenceKind === "string" &&
    isPreferenceKind(candidate.preferenceKind) &&
    typeof candidate.preferenceStatus === "string" &&
    isPreferenceStatus(candidate.preferenceStatus)
  );
}

export function isPreferencePort(value: unknown): value is PreferencePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as PreferencePort).createPreference === "function" &&
    typeof (value as PreferencePort).resolvePreference === "function"
  );
}
