import type { ConnectionStatus } from "../types";

export type SocialConnectionId = string;

/**
 * Opaque participant identity — never an Auth/Member import.
 */
export type ParticipantReference = string;

/**
 * Bidirectional social relation between two opaque participants (BR-0122).
 * Not UserConnection / MemberConnection — those names belong to other layers.
 */
export interface SocialConnection {
  id: SocialConnectionId;
  requesterReference: ParticipantReference;
  targetReference: ParticipantReference;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}
