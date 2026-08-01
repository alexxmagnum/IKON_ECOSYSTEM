export type MembershipPlanId = string;

/**
 * Opaque feature key for plan benefits (BR-0022: plan is the product catalog).
 * Not a pricing or billing engine.
 */
export type PlanFeatureRef = string;

/**
 * Membership plan / modality of belonging (MEMBERSHIP_PLAN).
 * No real prices or billing in this foundation.
 */
export interface MembershipPlan {
  id: MembershipPlanId;
  name: string;
  description?: string;
  /** Benefit / capability keys — interpretation is product-side. */
  featureRefs?: PlanFeatureRef[];
  metadata?: Record<string, unknown>;
}
