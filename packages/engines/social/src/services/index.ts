import type {
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
} from "../contracts";
import type { SocialConnectionId } from "../domain/connection";
import type { SocialGroupId } from "../domain/group";

/**
 * Service contracts for the Social Engine.
 * Implementations (persistence, discovery, messaging) arrive in later phases.
 */

export interface SocialConnectionService {
  create(input: CreateConnectionInput): Promise<ConnectionResult>;
  updateStatus(input: UpdateConnectionStatusInput): Promise<ConnectionResult>;
  get(connectionId: SocialConnectionId): Promise<ConnectionResult | null>;
  list(query: ListConnectionsQuery): Promise<ConnectionResult[]>;
}

export interface SocialGroupService {
  create(input: CreateGroupInput): Promise<GroupResult>;
  update(input: UpdateGroupInput): Promise<GroupResult>;
  join(input: JoinGroupInput): Promise<ParticipationResult>;
  leave(input: LeaveGroupInput): Promise<ParticipationResult>;
  get(groupId: SocialGroupId): Promise<GroupResult | null>;
  list(query: ListGroupsQuery): Promise<GroupResult[]>;
  listParticipations(
    query: ListParticipationsQuery,
  ): Promise<ParticipationResult[]>;
}
