import type {
  ParticipantReference,
  SocialConnection,
  SocialConnectionId,
} from "../domain/connection";
import type {
  ConsumerReference,
  SocialGroup,
  SocialGroupId,
} from "../domain/group";
import type {
  SocialParticipation,
  SocialParticipationId,
} from "../domain/participation";
import type {
  ConnectionStatus,
  GroupStatus,
  GroupVisibility,
  ParticipationStatus,
} from "../types";

/**
 * API-oriented TypeScript contracts for a future Social Engine HTTP surface.
 * No route handlers or transport concerns live here.
 */

export interface CreateConnectionInput {
  requesterReference: ParticipantReference;
  targetReference: ParticipantReference;
  metadata?: Record<string, unknown>;
}

export interface UpdateConnectionStatusInput {
  connectionId: SocialConnectionId;
  status: ConnectionStatus;
}

export interface ConnectionResult {
  connection: SocialConnection;
}

export interface ListConnectionsQuery {
  participantReference?: ParticipantReference;
  status?: ConnectionStatus | ConnectionStatus[];
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  visibility: GroupVisibility;
  status?: GroupStatus;
  creatorReference?: ParticipantReference;
  consumerReference?: ConsumerReference;
  metadata?: Record<string, unknown>;
}

export interface UpdateGroupInput {
  groupId: SocialGroupId;
  name?: string;
  description?: string;
  visibility?: GroupVisibility;
  status?: GroupStatus;
  metadata?: Record<string, unknown>;
}

export interface GroupResult {
  group: SocialGroup;
}

export interface ListGroupsQuery {
  visibility?: GroupVisibility;
  status?: GroupStatus | GroupStatus[];
  creatorReference?: ParticipantReference;
}

export interface JoinGroupInput {
  groupId: SocialGroupId;
  participantReference: ParticipantReference;
  status?: ParticipationStatus;
  metadata?: Record<string, unknown>;
}

export interface LeaveGroupInput {
  participationId: SocialParticipationId;
}

export interface ParticipationResult {
  participation: SocialParticipation;
}

export interface ListParticipationsQuery {
  groupId?: SocialGroupId;
  participantReference?: ParticipantReference;
  status?: ParticipationStatus | ParticipationStatus[];
}
