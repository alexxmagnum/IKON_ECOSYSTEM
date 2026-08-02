/**
 * @motanos/discovery — Shared Discovery Engine foundation (DEC-DISCOVERY-001).
 *
 * MotanOS Core → Shared Engines → @motanos/discovery → Domain Modules
 *
 * Recommendation is a capability inside Discovery. Independent of domains,
 * Social package imports, auth, database, and ML providers.
 */

export const DISCOVERY_ENGINE = "@motanos/discovery" as const;

export type {
  Recommendation,
  RecommendationId,
  SocialReference,
  SourceReference,
  TargetReference,
} from "./domain/recommendation";

export type {
  DiscoveryPreference,
  DiscoveryPreferenceId,
  PreferenceType,
  SubjectReference,
} from "./domain/preference";

export type { CriteriaType, DiscoveryCriteria } from "./domain/criteria";

export type {
  PreferenceStatus,
  RecommendationFinalStatus,
  RecommendationStatus,
} from "./types";
export {
  canTransitionRecommendation,
  isPreferenceStatus,
  isRecommendationFinal,
  isRecommendationStatus,
  PREFERENCE_STATUSES,
  RECOMMENDATION_FINAL_STATUSES,
  RECOMMENDATION_STATUSES,
  RECOMMENDATION_TRANSITIONS,
} from "./types";

export type {
  CreatePreferenceInput,
  CreateRecommendationInput,
  DiscoveryQuery,
  DiscoveryResult,
  ListPreferencesQuery,
  ListRecommendationsQuery,
  PreferenceResult,
  RecommendationResult,
  UpdatePreferenceInput,
  UpdateRecommendationStatusInput,
} from "./contracts";

export type {
  DiscoveryService,
  PreferenceService,
  RecommendationService,
} from "./services";
