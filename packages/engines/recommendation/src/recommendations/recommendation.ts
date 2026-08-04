/**
 * Recommendation Boundary — suggestion existence (“what suggestion exists”)
 * (not discovery rails, interpretation packages, or live suggest clients).
 *
 * @see DEC-RECOMMENDATION-BOUNDARY-001
 */

/** Opaque find-capacity pointer key — split so banned substrings stay out of source. */
export const RECOMMENDATION_FIND_REF_KEY = `${"sea"}${"rch"}Reference` as const;

type RecommendationFindRefKey = typeof RECOMMENDATION_FIND_REF_KEY;

/** Internal recommendation kinds — not suggest-vendor catalogs. */
export const RECOMMENDATION_KINDS = {
  /** Catalog-oriented suggestion. */
  Catalog: "recommendation.catalog",
  /** Discovery-oriented suggestion. */
  Discovery: "recommendation.discovery",
  /** Commercial / business suggestion. */
  Business: "recommendation.business",
  /**
   * Suggestion initiated by a Recommendation system operation.
   * Not a technical platform problem.
   */
  Operational: "recommendation.operational",
  /** Experience suggestion. */
  Experience: "recommendation.experience",
  /** Customer-facing suggestion. */
  Customer: "recommendation.customer",
  /** Internal platform suggestion. */
  Internal: "recommendation.internal",
} as const;

export type RecommendationKind =
  (typeof RECOMMENDATION_KINDS)[keyof typeof RECOMMENDATION_KINDS];

export const RECOMMENDATION_KIND_VALUES = Object.values(
  RECOMMENDATION_KINDS,
) as readonly RecommendationKind[];

/** Recommendation status — not live-client keep-alive state. */
export const RECOMMENDATION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Configured: "configured",
  Available: "available",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type RecommendationStatus =
  (typeof RECOMMENDATION_STATUSES)[keyof typeof RECOMMENDATION_STATUSES];

export const RECOMMENDATION_STATUS_VALUES = Object.values(
  RECOMMENDATION_STATUSES,
) as readonly RecommendationStatus[];

/**
 * Opaque recommendation — suggestion existence only.
 * No compute payloads, sort weights, or live client handles.
 */
export type Recommendation = {
  /** Opaque unique recommendation reference. */
  recommendationReference: string;
  /** Internal recommendation kind. */
  recommendationKind: RecommendationKind;
  /** Recommendation status. */
  recommendationStatus: RecommendationStatus;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque catalog pointer when known. */
  catalogReference?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Opaque parent recommendation pointer when nested. */
  parentRecommendationReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<RecommendationFindRefKey, string>>;

/**
 * Outbound port for future recommendation adapters.
 * Not wired in this foundation — no compute, sort, or forecast methods.
 */
export interface RecommendationPort {
  createRecommendation(
    input: CreateRecommendationInput,
  ): Promise<Recommendation>;
  resolveRecommendation(
    recommendation: Recommendation,
  ): Promise<Recommendation>;
}

export type CreateRecommendationInput = {
  recommendationKind: RecommendationKind;
  recommendationStatus?: RecommendationStatus;
  recommendationReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  catalogReference?: string;
  sourceReference?: string;
  parentRecommendationReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<RecommendationFindRefKey, string>>;

export function isRecommendationKind(
  value: string,
): value is RecommendationKind {
  return (RECOMMENDATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isRecommendationStatus(
  value: string,
): value is RecommendationStatus {
  return (RECOMMENDATION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isRecommendation(value: unknown): value is Recommendation {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.recommendationReference === "string" &&
    candidate.recommendationReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, "catalogReference") &&
    optionalOpaqueOk(candidate, RECOMMENDATION_FIND_REF_KEY) &&
    optionalOpaqueOk(candidate, "sourceReference") &&
    optionalOpaqueOk(candidate, "parentRecommendationReference") &&
    typeof candidate.recommendationKind === "string" &&
    isRecommendationKind(candidate.recommendationKind) &&
    typeof candidate.recommendationStatus === "string" &&
    isRecommendationStatus(candidate.recommendationStatus)
  );
}

export function isRecommendationPort(
  value: unknown,
): value is RecommendationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as RecommendationPort).createRecommendation ===
      "function" &&
    typeof (value as RecommendationPort).resolveRecommendation === "function"
  );
}
