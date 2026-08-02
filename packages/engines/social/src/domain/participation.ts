import type { ParticipantReference } from "./connection";
import type { SocialGroupId } from "./group";
import type { ParticipationStatus } from "../types";

export type SocialParticipationId = string;

/**
 * Explicit membership of a participant in a social group (BR-0121).
 * Distinct from Event/Tournament/Member participation aggregates.
 */
export interface SocialParticipation {
  id: SocialParticipationId;
  participantReference: ParticipantReference;
  groupReference: SocialGroupId;
  status: ParticipationStatus;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
