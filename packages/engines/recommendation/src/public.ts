/**
 * @motanos/recommendation — Recommendation Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/recommendation
 *
 * Recommendation = what suggestion exists.
 * Must not depend on find packages, interpretation packages,
 * measurement packages, or live technical suggest engines.
 *
 * @see DEC-RECOMMENDATION-BOUNDARY-001
 */

export const RECOMMENDATION_BOUNDARY = "@motanos/recommendation" as const;

export type {
  CreateRecommendationInput,
  CreateRecommendationOptions,
  Recommendation,
  RecommendationKind,
  RecommendationPort,
  RecommendationStatus,
} from "./recommendations/mod";
export {
  RECOMMENDATION_FIND_REF_KEY,
  RECOMMENDATION_KINDS,
  RECOMMENDATION_KIND_VALUES,
  RECOMMENDATION_STATUSES,
  RECOMMENDATION_STATUS_VALUES,
  createRecommendation,
  isRecommendation,
  isRecommendationKind,
  isRecommendationPort,
  isRecommendationStatus,
  resetRecommendationReferenceSequence,
} from "./recommendations/mod";
