/**
 * @motanos/community — Community Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/community
 *
 * Community = belonging and social participation.
 * Identity = who you are. Membership = commercial relationship.
 * Experience = what is offered. Booking = when you participate.
 *
 * Must not depend on booking, resource, experience, commerce, auth, or persistence.
 *
 * @see DEC-COMMUNITY-BOUNDARY-001
 */

export const COMMUNITY_ENGINE = "@motanos/community" as const;

export type {
  Community,
  CommunityKind,
  CommunityPort,
  CommunityStatus,
  CreateCommunityInput,
  CreateCommunityOptions,
} from "./communities";
export {
  COMMUNITY_KINDS,
  COMMUNITY_KIND_VALUES,
  COMMUNITY_STATUSES,
  COMMUNITY_STATUS_VALUES,
  createCommunity,
  isCommunity,
  isCommunityKind,
  isCommunityPort,
  isCommunityStatus,
  resetCommunityReferenceSequence,
} from "./communities";
