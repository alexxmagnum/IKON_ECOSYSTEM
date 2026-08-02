/**
 * @motanos/social — Shared Social Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/social → Domain Modules
 *
 * Independent of domains, auth, database, and messaging providers.
 */

export const SOCIAL_ENGINE = "@motanos/social" as const;

export type {
  ParticipantReference,
  SocialConnection,
  SocialConnectionId,
} from "./domain/connection";

export type {
  ConsumerReference,
  SocialGroup,
  SocialGroupId,
} from "./domain/group";

export type {
  SocialParticipation,
  SocialParticipationId,
} from "./domain/participation";

export type {
  ConnectionStatus,
  GroupStatus,
  GroupVisibility,
  ParticipationStatus,
} from "./types";
export {
  canTransitionConnection,
  CONNECTION_STATUSES,
  CONNECTION_TRANSITIONS,
  GROUP_STATUSES,
  GROUP_VISIBILITIES,
  isConnectionStatus,
  isGroupStatus,
  isGroupVisibility,
  isParticipationStatus,
  PARTICIPATION_STATUSES,
} from "./types";

export type {
  ConnectionResult,
  CreateConnectionInput,
  CreateGroupInput,
  GroupResult,
  JoinGroupInput,
  LeaveGroupInput,
  ListConnectionsQuery,
  ListGroupsQuery,
  ListParticipationsQuery,
  ParticipationResult,
  UpdateConnectionStatusInput,
  UpdateGroupInput,
} from "./contracts";

export type {
  SocialConnectionService,
  SocialGroupService,
} from "./services";
