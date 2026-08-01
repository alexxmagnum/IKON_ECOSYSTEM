import type {
  BookingHistoryRef,
  EventParticipationRef,
  IdentityReference,
  Member,
  MemberId,
} from "../domain/member";
import type {
  Membership,
  MembershipId,
  PaymentReference,
} from "../domain/membership";
import type {
  MembershipPlan,
  MembershipPlanId,
  PlanFeatureRef,
} from "../domain/plan";
import type { MemberStatus, MembershipStatus } from "../types";

/**
 * API-oriented TypeScript contracts for a future Members domain surface.
 * No route handlers. Identity mutations belong to Core Identity.
 */

export interface CreateMemberInput {
  identityReference: IdentityReference;
  displayName?: string;
  status?: MemberStatus;
  memberNumber?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemberStatusInput {
  memberId: MemberId;
  status: MemberStatus;
}

export interface CreateMembershipPlanInput {
  name: string;
  description?: string;
  featureRefs?: PlanFeatureRef[];
  metadata?: Record<string, unknown>;
}

export interface CreateMembershipInput {
  memberId: MemberId;
  planId: MembershipPlanId;
  status?: MembershipStatus;
  startsAt?: string;
  endsAt?: string;
  paymentReference?: PaymentReference;
  metadata?: Record<string, unknown>;
}

export interface UpdateMembershipStatusInput {
  membershipId: MembershipId;
  status: MembershipStatus;
}

export interface AttachMembershipPaymentReferenceInput {
  membershipId: MembershipId;
  paymentReference: PaymentReference;
}

export interface AttachMemberParticipationRefsInput {
  memberId: MemberId;
  eventParticipationRefs?: EventParticipationRef[];
  bookingHistoryRefs?: BookingHistoryRef[];
}

export interface MemberResult {
  member: Member;
}

export interface MembershipResult {
  membership: Membership;
}

export interface MembershipPlanResult {
  plan: MembershipPlan;
}

export interface ListMembersQuery {
  status?: MemberStatus | MemberStatus[];
  identityReference?: IdentityReference;
}

export interface ListMembershipsQuery {
  memberId?: MemberId;
  planId?: MembershipPlanId;
  status?: MembershipStatus | MembershipStatus[];
}
