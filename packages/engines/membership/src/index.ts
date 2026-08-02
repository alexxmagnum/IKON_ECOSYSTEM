/**
 * @motanos/membership — Membership Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/membership
 *
 * Membership = relation between an identity and an organization.
 * Identity / Community / Experience / Booking / Commerce live elsewhere.
 *
 * Must not depend on identity, community, experience, booking, commerce,
 * auth packages, or persistence vendors.
 *
 * Distinct from Booking Membership Boundary (opaque context inside Booking).
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
