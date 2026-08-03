/**
 * @motanos/membership — Membership Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/membership
 *
 * Membership = belonging relation between an actor and a context.
 * Must not depend on identity packages, access-control packages,
 * economic-record packages, collect-rail packages, or persistence vendors.
 *
 * @see DEC-MEMBERSHIP-BOUNDARY-001
 */

export const MEMBERSHIP_ENGINE = "@motanos/membership" as const;

export type {
  CreateMembershipInput,
  CreateMembershipOptions,
  Membership,
  MembershipKind,
  MembershipPort,
  MembershipStatus,
} from "./memberships";
export {
  MEMBERSHIP_KINDS,
  MEMBERSHIP_KIND_VALUES,
  MEMBERSHIP_STATUSES,
  MEMBERSHIP_STATUS_VALUES,
  createMembership,
  isMembership,
  isMembershipKind,
  isMembershipPort,
  isMembershipStatus,
  resetMembershipReferenceSequence,
} from "./memberships";
