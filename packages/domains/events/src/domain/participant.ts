import type { EventId } from "./event";
import type { EventParticipantStatus } from "../types";

export type EventParticipantId = string;

/**
 * Opaque platform user id when the participant is linked to an account.
 * No dependency on the auth package — string reference only.
 */
export type ParticipantRef = string;

/**
 * Registration / participation in an event (docs/42 — Event Registration).
 * Not a social graph or chat system.
 */
export interface EventParticipant {
  id: EventParticipantId;
  eventId: EventId;
  /** Opaque participant identity reference. */
  participantRef: ParticipantRef;
  status: EventParticipantStatus;
  displayName?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
