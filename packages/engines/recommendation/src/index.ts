/**
 * @motanos/recommendation — Recommendation Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/recommendation
 *
 * Recommendation = conceptual suggestions for a context.
 * Discovery engines own find flows; measurement packages own signals;
 * compute vendors own how suggestions get produced.
 *
 * Must not depend on discovery packages, measurement packages, identity,
 * community, experience, commerce, or persistence vendors.
 *
 * @see DEC-RECOMMENDATION-BOUNDARY-001
 */

export const RECOMMENDATION_ENGINE = "@motanos/recommendation" as const;

export type {
  CreateRecommendationInput,
  CreateRecommendationOptions,
  Recommendation,
  RecommendationKind,
  RecommendationPort,
  RecommendationStatus,
} from "./recommendations";
export {
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
} from "./recommendations";
