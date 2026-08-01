import type { MemberId } from "./member";
import type { MembershipPlanId } from "./plan";
import type { MembershipStatus } from "../types";

export type MembershipId = string;

/**
 * Opaque future Payment Engine reference — no charge or invoice logic here.
 */
export type PaymentReference = string;

/**
 * Concrete membership linking a Member to a MembershipPlan (MEMBERSHIP machine).
 * Schema maps to user_id + membership_plan_id; here identity is via Member.
 */
export interface Membership {
  id: MembershipId;
  memberId: MemberId;
  planId: MembershipPlanId;
  status: MembershipStatus;
  /** Validity window (ISO-8601). */
  startsAt?: string;
  endsAt?: string;
  /** Future payment / dues reference — abstract only. */
  paymentReference?: PaymentReference;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
