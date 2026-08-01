import type { MemberId } from "@motanos/domain-members";
import type { TournamentId } from "./tournament";
import type { TournamentParticipantStatus } from "../types";

export type TournamentParticipantId = string;

/**
 * Opaque participant identity.
 * May resolve later to Member, GolfPlayer, or external identity —
 * the entry link stays opaque; typed Member hint is optional for consumers.
 */
export type ParticipantReference = string;

/** Optional typed resolution when the participant is a Member. */
export type MemberParticipantReference = MemberId;

/**
 * Registered entry in a tournament (docs/43 — Tournament Entry).
 * Not a member/player/user duplicate.
 */
export interface TournamentParticipant {
  id: TournamentParticipantId;
  tournamentId: TournamentId;
  participantReference: ParticipantReference;
  status: TournamentParticipantStatus;
  displayName?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
