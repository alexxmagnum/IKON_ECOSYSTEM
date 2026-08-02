/**
 * Free-form criterion type for discovery queries.
 * No evaluation / matching algorithm in this foundation.
 */
export type CriteriaType = string;

/**
 * Filter / affinity criterion used when asking Discovery to search.
 * Weight is a consumer hint only — not scored here.
 */
export interface DiscoveryCriteria {
  type: CriteriaType;
  value: string | number | boolean | Record<string, unknown>;
  weight?: number;
  metadata?: Record<string, unknown>;
}
