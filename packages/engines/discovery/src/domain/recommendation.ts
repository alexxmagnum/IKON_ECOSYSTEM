import type { RecommendationStatus } from "../types";

export type RecommendationId = string;

/**
 * Opaque subject that receives the suggestion (BR-0135: owned by a concrete subject).
 * Never an Auth/Member import.
 */
export type TargetReference = string;

/**
 * Opaque item / experience being suggested.
 * Kind is free-form; Discovery does not interpret domain vocabulary.
 */
export interface SourceReference {
  kind: string;
  id: string;
}

/**
 * Optional opaque social signal (DEC-DISCOVERY-004).
 * Never import @motanos/social aggregates into this package.
 */
export type SocialReference = string;

/**
 * Abstract suggestion (docs/50 + Recommendation entity).
 * Not a domain-specific recommendation type.
 */
export interface Recommendation {
  id: RecommendationId;
  /** Who the suggestion is for. */
  targetReference: TargetReference;
  /** What is being suggested (opaque). */
  sourceReference?: SourceReference;
  status: RecommendationStatus;
  /**
   * Optional normalized confidence metadata (DEC-DISCOVERY-003).
   * Conceptual range: 0 <= score <= 1 (e.g. 0.92).
   * Not ranking position, list order, or absolute priority.
   * Produced externally — this package does not score or rank.
   */
  score?: number;
  createdAt: string;
  socialReference?: SocialReference;
  reason?: string;
  metadata?: Record<string, unknown>;
  updatedAt?: string;
  expiresAt?: string;
}
