/**
 * @motanos/domain-members — Members Domain Module foundation.
 *
 * MotanOS Core → Identity Foundation → Members Domain
 *
 * Adds business membership knowledge on top of Identity.
 * Must not depend on auth, database, permissions, branding, or gateways.
 */

export const MEMBERS_DOMAIN = "@motanos/domain-members" as const;

export type {
  BookingHistoryRef,
  EventParticipationRef,
  IdentityReference,
  Member,
  MemberId,
} from "./domain/member";

export type {
  Membership,
  MembershipId,
  PaymentReference,
} from "./domain/membership";

export type {
  MembershipPlan,
  MembershipPlanId,
  PlanFeatureRef,
} from "./domain/plan";

export type {
  MemberStatus,
  MembershipEvent,
  MembershipFinalStatus,
  MembershipRenewalStatus,
  MembershipStatus,
} from "./types";
export {
  canTransitionMembership,
  isMemberStatus,
  isMembershipFinal,
  isMembershipStatus,
  MEMBER_STATUSES,
  MEMBERSHIP_EVENTS,
  MEMBERSHIP_FINAL_STATUSES,
  MEMBERSHIP_RENEWAL_STATUSES,
  MEMBERSHIP_STATUSES,
  MEMBERSHIP_TRANSITIONS,
} from "./types";

export type {
  AttachMemberParticipationRefsInput,
  AttachMembershipPaymentReferenceInput,
  CreateMemberInput,
  CreateMembershipInput,
  CreateMembershipPlanInput,
  ListMembersQuery,
  ListMembershipsQuery,
  MemberResult,
  MembershipPlanResult,
  MembershipResult,
  UpdateMemberStatusInput,
  UpdateMembershipStatusInput,
} from "./contracts";

export type {
  MemberService,
  MembershipPlanService,
  MembershipService,
} from "./services";
