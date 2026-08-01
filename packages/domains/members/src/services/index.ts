import type {
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
} from "../contracts";
import type { MemberId } from "../domain/member";
import type { MembershipId } from "../domain/membership";
import type { MembershipPlanId } from "../domain/plan";

/**
 * Members domain service contracts.
 * Implementations must resolve Identity Core separately — never own auth.
 */

export interface MemberService {
  create(input: CreateMemberInput): Promise<MemberResult>;
  updateStatus(input: UpdateMemberStatusInput): Promise<MemberResult>;
  attachParticipationRefs(
    input: AttachMemberParticipationRefsInput,
  ): Promise<MemberResult>;
  getById(memberId: MemberId): Promise<MemberResult | null>;
  list(query: ListMembersQuery): Promise<MemberResult[]>;
}

export interface MembershipPlanService {
  create(input: CreateMembershipPlanInput): Promise<MembershipPlanResult>;
  getById(planId: MembershipPlanId): Promise<MembershipPlanResult | null>;
  list(): Promise<MembershipPlanResult[]>;
}

export interface MembershipService {
  create(input: CreateMembershipInput): Promise<MembershipResult>;
  updateStatus(input: UpdateMembershipStatusInput): Promise<MembershipResult>;
  attachPaymentReference(
    input: AttachMembershipPaymentReferenceInput,
  ): Promise<MembershipResult>;
  getById(membershipId: MembershipId): Promise<MembershipResult | null>;
  list(query: ListMembershipsQuery): Promise<MembershipResult[]>;
}
