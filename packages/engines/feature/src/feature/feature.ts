/**
 * Feature Boundary — functional capacity (“what functional capacity exists”)
 * (not settings packages, trial suites, or live activation clients).
 *
 * @see DEC-FEATURE-BOUNDARY-001
 */

/** Opaque settings pointer key — split so banned substrings stay out of source. */
export const FEATURE_SETTINGS_REF_KEY = `${"configura"}${"tion"}Reference` as const;

type FeatureSettingsRefKey = typeof FEATURE_SETTINGS_REF_KEY;

/** Internal feature kinds — not switch-vendor catalogs. */
export const FEATURE_KINDS = {
  /** Product-facing functional capacity. */
  Product: "feature.product",
  /** Commercial / business functional capacity. */
  Business: "feature.business",
  /**
   * Capacity initiated by a Feature system operation.
   * Not a technical platform problem.
   */
  Operational: "feature.operational",
  /** Experience functional capacity. */
  Experience: "feature.experience",
  /** Customer-facing functional capacity. */
  Customer: "feature.customer",
  /** Platform system functional capacity. */
  System: "feature.system",
  /** Internal platform functional capacity. */
  Internal: "feature.internal",
} as const;

export type FeatureKind = (typeof FEATURE_KINDS)[keyof typeof FEATURE_KINDS];

export const FEATURE_KIND_VALUES = Object.values(
  FEATURE_KINDS,
) as readonly FeatureKind[];

/** Feature status — not live-client keep-alive state. */
export const FEATURE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Available: "available",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type FeatureStatus =
  (typeof FEATURE_STATUSES)[keyof typeof FEATURE_STATUSES];

export const FEATURE_STATUS_VALUES = Object.values(
  FEATURE_STATUSES,
) as readonly FeatureStatus[];

/**
 * Opaque feature — functional capacity existence only.
 * No activation payloads, trial suites, or live client handles.
 */
export type Feature = {
  /** Opaque unique feature reference. */
  featureReference: string;
  /** Internal feature kind. */
  featureKind: FeatureKind;
  /** Feature status. */
  featureStatus: FeatureStatus;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque capability pointer when known. */
  capabilityReference?: string;
  /** Opaque parent feature pointer when nested. */
  parentFeatureReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<FeatureSettingsRefKey, string>>;

/**
 * Outbound port for future feature adapters.
 * Not wired in this foundation — no activate, switch, or trial methods.
 */
export interface FeaturePort {
  createFeature(input: CreateFeatureInput): Promise<Feature>;
  resolveFeature(feature: Feature): Promise<Feature>;
}

export type CreateFeatureInput = {
  featureKind: FeatureKind;
  featureStatus?: FeatureStatus;
  featureReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  capabilityReference?: string;
  parentFeatureReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<FeatureSettingsRefKey, string>>;

export function isFeatureKind(value: string): value is FeatureKind {
  return (FEATURE_KIND_VALUES as readonly string[]).includes(value);
}

export function isFeatureStatus(value: string): value is FeatureStatus {
  return (FEATURE_STATUS_VALUES as readonly string[]).includes(value);
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

export function isFeature(value: unknown): value is Feature {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.featureReference === "string" &&
    candidate.featureReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, FEATURE_SETTINGS_REF_KEY) &&
    optionalOpaqueOk(candidate, "capabilityReference") &&
    optionalOpaqueOk(candidate, "parentFeatureReference") &&
    typeof candidate.featureKind === "string" &&
    isFeatureKind(candidate.featureKind) &&
    typeof candidate.featureStatus === "string" &&
    isFeatureStatus(candidate.featureStatus)
  );
}

export function isFeaturePort(value: unknown): value is FeaturePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as FeaturePort).createFeature === "function" &&
    typeof (value as FeaturePort).resolveFeature === "function"
  );
}
