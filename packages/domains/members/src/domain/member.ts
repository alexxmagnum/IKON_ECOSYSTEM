import type { MemberStatus } from "../types";

export type MemberId = string;

/**
 * Opaque reference to Identity Core (user / account id).
 * Members never imports auth or database packages.
 */
export type IdentityReference = string;

/**
 * Opaque future links for participation history — no real history yet.
 */
export type EventParticipationRef = string;
export type BookingHistoryRef = string;

/**
 * Business relationship of a person with the organization.
 * Not a User, AuthUser, or Session — those belong to Identity Core.
 */
export interface Member {
  id: MemberId;
  /** Link to Identity Core account. */
  identityReference: IdentityReference;
  displayName?: string;
  status: MemberStatus;
  /** Optional member number for digital card (docs/44). */
  memberNumber?: string;
  /**
   * Future participation anchors — opaque ids only.
   * No Events/Booking engines imported in this package.
   */
  eventParticipationRefs?: EventParticipationRef[];
  bookingHistoryRefs?: BookingHistoryRef[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
