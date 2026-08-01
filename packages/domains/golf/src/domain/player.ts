export type GolfPlayerId = string;

/**
 * Opaque platform user id when the player is linked to an account.
 * No dependency on the auth package — string reference only.
 */
export type UserRef = string;

/**
 * Participant in a golf round or flight.
 */
export interface GolfPlayer {
  id: GolfPlayerId;
  /** Optional link to a MotanOS user identity. */
  userId?: UserRef;
  displayName: string;
  metadata?: Record<string, unknown>;
}
