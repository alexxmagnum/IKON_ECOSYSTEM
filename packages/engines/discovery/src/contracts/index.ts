import type { DiscoveryCriteria } from "../domain/criteria";
import type {
  DiscoveryPreference,
  DiscoveryPreferenceId,
  PreferenceType,
  SubjectReference,
} from "../domain/preference";
import type {
  Recommendation,
  RecommendationId,
  SocialReference,
  SourceReference,
  TargetReference,
} from "../domain/recommendation";
import type { PreferenceStatus, RecommendationStatus } from "../types";

/**
 * API-oriented TypeScript contracts for a future Discovery HTTP surface.
 * No route handlers, ranking, or ML concerns live here.
 */

export interface CreateRecommendationInput {
  targetReference: TargetReference;
  sourceReference?: SourceReference;
  status?: RecommendationStatus;
  score?: number;
  socialReference?: SocialReference;
  reason?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateRecommendationStatusInput {
  recommendationId: RecommendationId;
  status: RecommendationStatus;
}

export interface RecommendationResult {
  recommendation: Recommendation;
}

export interface ListRecommendationsQuery {
  targetReference?: TargetReference;
  status?: RecommendationStatus | RecommendationStatus[];
  sourceKind?: string;
}

export interface CreatePreferenceInput {
  subjectReference: SubjectReference;
  preferenceType: PreferenceType;
  value: string | number | boolean | Record<string, unknown>;
  status?: PreferenceStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdatePreferenceInput {
  preferenceId: DiscoveryPreferenceId;
  value?: string | number | boolean | Record<string, unknown>;
  status?: PreferenceStatus;
  metadata?: Record<string, unknown>;
}

export interface PreferenceResult {
  preference: DiscoveryPreference;
}

export interface ListPreferencesQuery {
  subjectReference: SubjectReference;
  preferenceType?: PreferenceType;
  status?: PreferenceStatus | PreferenceStatus[];
}

/**
 * Abstract discover request — engines/domains fill opaque refs + criteria.
 * Evaluation is deferred to a future implementation phase.
 */
export interface DiscoveryQuery {
  subjectReference: SubjectReference;
  criteria?: DiscoveryCriteria[];
  limit?: number;
  socialReference?: SocialReference;
  metadata?: Record<string, unknown>;
}

export interface DiscoveryResult {
  recommendations: Recommendation[];
  /** Opaque evaluation notes — never algorithmic payload. */
  notes?: string[];
  metadata?: Record<string, unknown>;
}
