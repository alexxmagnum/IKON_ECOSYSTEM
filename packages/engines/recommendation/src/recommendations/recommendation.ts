/**
 * Recommendation Engine Boundary — conceptual suggestions / suggestion context
 * (not external compute vendors, discovery engines, or measurement packages).
 *
 * @see DEC-RECOMMENDATION-BOUNDARY-001
 */

/** Internal recommendation kinds — not vendor suggestion catalogs. */
export const RECOMMENDATION_KINDS = {
  /** Suggested activity / offering. */
  Experience: "recommendation.experience",
  /** Suggested group. */
  Community: "recommendation.community",
  /** Suggested content. */
  Content: "recommendation.content",
  /** Related resource suggestion. */
  Resource: "recommendation.resource",
  /**
   * Recommendation initiated by a Recommendation system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "recommendation.operational",
  /** Commercial opportunity suggestion. */
  Business: "recommendation.business",
} as const;

export type RecommendationKind =
  (typeof RECOMMENDATION_KINDS)[keyof typeof RECOMMENDATION_KINDS];

export const RECOMMENDATION_KIND_VALUES = Object.values(
  RECOMMENDATION_KINDS,
) as readonly RecommendationKind[];

/** Recommendation status — not vendor compute pipeline state. */
export const RECOMMENDATION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Accepted: "accepted",
  Dismissed: "dismissed",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type RecommendationStatus =
  (typeof RECOMMENDATION_STATUSES)[keyof typeof RECOMMENDATION_STATUSES];

export const RECOMMENDATION_STATUS_VALUES = Object.values(
  RECOMMENDATION_STATUSES,
) as readonly RecommendationStatus[];

/**
 * Opaque recommendation — conceptual suggestion only.
 * No credential material or live compute payloads.
 */
export interface Recommendation {
  /** Opaque unique recommendation reference. */
  recommendationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal recommendation kind. */
  recommendationKind: RecommendationKind;
  /** Recommendation status. */
  recommendationStatus: RecommendationStatus;
  /** Opaque target pointer when known. */
  targetReference?: string;
  /** Opaque target kind label when known. */
  targetKind?: string;
  /** Opaque suggestion-context pointer when known. */
  contextReference?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Opaque owner pointer when known. */
  ownerReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future recommendation adapters (Runtime).
 * Not wired in this foundation — no suggest-compute, sort, or forecast methods.
 */
export interface RecommendationPort {
  createRecommendation(
    input: CreateRecommendationInput,
  ): Promise<Recommendation>;
  resolveRecommendation(
    recommendation: Recommendation,
  ): Promise<Recommendation>;
}

export interface CreateRecommendationInput {
  tenantReference: string;
  recommendationKind: RecommendationKind;
  recommendationStatus?: RecommendationStatus;
  recommendationReference?: string;
  targetReference?: string;
  targetKind?: string;
  contextReference?: string;
  sourceReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
}

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

export function isRecommendation(value: unknown): value is Recommendation {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const targetOk =
    candidate.targetReference === undefined ||
    (typeof candidate.targetReference === "string" &&
      candidate.targetReference.length > 0);
  const targetKindOk =
    candidate.targetKind === undefined ||
    (typeof candidate.targetKind === "string" &&
      candidate.targetKind.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const sourceOk =
    candidate.sourceReference === undefined ||
    (typeof candidate.sourceReference === "string" &&
      candidate.sourceReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  return (
    typeof candidate.recommendationReference === "string" &&
    candidate.recommendationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    targetOk &&
    targetKindOk &&
    contextOk &&
    sourceOk &&
    ownerOk &&
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
