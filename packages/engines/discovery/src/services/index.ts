import type {
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
} from "../contracts";
import type { RecommendationId } from "../domain/recommendation";

/**
 * Service contracts for the Discovery Engine.
 * Implementations must not live in this foundation — interfaces only.
 * Hard business rules (availability, permissions, payments) always win (BR-0138).
 */

export interface RecommendationService {
  create(input: CreateRecommendationInput): Promise<RecommendationResult>;
  updateStatus(
    input: UpdateRecommendationStatusInput,
  ): Promise<RecommendationResult>;
  get(recommendationId: RecommendationId): Promise<RecommendationResult | null>;
  list(query: ListRecommendationsQuery): Promise<RecommendationResult[]>;
}

export interface PreferenceService {
  create(input: CreatePreferenceInput): Promise<PreferenceResult>;
  update(input: UpdatePreferenceInput): Promise<PreferenceResult>;
  list(query: ListPreferencesQuery): Promise<PreferenceResult[]>;
}

/**
 * High-level discovery surface.
 * `discover` / `evaluate` return shapes only — no ranking or ML here.
 */
export interface DiscoveryService {
  discover(query: DiscoveryQuery): Promise<DiscoveryResult>;
  evaluate(query: DiscoveryQuery): Promise<DiscoveryResult>;
}
