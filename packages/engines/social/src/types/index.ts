/**
 * Social connection / group / participation statuses.
 * Aligned with docs/48_SOCIAL_EXPERIENCE_ENGINE (invitations) and BR-0120–BR-0122.
 * No dedicated FRIENDSHIP machine exists in state-machines.md.
 */

/**
 * Connection / friendship request statuses.
 * Invitation SoT: Pending, Accepted, Rejected, Cancelled, Expired.
 * `Blocked` covers consent revocation / safety (prompt + social privacy BR).
 */
export const CONNECTION_STATUSES = [
  "Pending",
  "Accepted",
  "Rejected",
  "Cancelled",
  "Expired",
  "Blocked",
] as const;

export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const GROUP_VISIBILITIES = ["Public", "Private"] as const;

export type GroupVisibility = (typeof GROUP_VISIBILITIES)[number];

export const GROUP_STATUSES = ["Active", "Archived"] as const;

export type GroupStatus = (typeof GROUP_STATUSES)[number];

/** Explicit group membership statuses (BR-0121). */
export const PARTICIPATION_STATUSES = [
  "Invited",
  "Joined",
  "Left",
] as const;

export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number];

export function isConnectionStatus(value: string): value is ConnectionStatus {
  return (CONNECTION_STATUSES as readonly string[]).includes(value);
}

export function isGroupVisibility(value: string): value is GroupVisibility {
  return (GROUP_VISIBILITIES as readonly string[]).includes(value);
}

export function isGroupStatus(value: string): value is GroupStatus {
  return (GROUP_STATUSES as readonly string[]).includes(value);
}

export function isParticipationStatus(
  value: string,
): value is ParticipationStatus {
  return (PARTICIPATION_STATUSES as readonly string[]).includes(value);
}

/** Valid connection status transitions (consent-based; BR-0122). */
export const CONNECTION_TRANSITIONS: ReadonlyArray<{
  from: ConnectionStatus;
  to: ConnectionStatus;
}> = [
  { from: "Pending", to: "Accepted" },
  { from: "Pending", to: "Rejected" },
  { from: "Pending", to: "Cancelled" },
  { from: "Pending", to: "Expired" },
  { from: "Accepted", to: "Blocked" },
  { from: "Accepted", to: "Cancelled" },
  { from: "Blocked", to: "Cancelled" },
];

export function canTransitionConnection(
  from: ConnectionStatus,
  to: ConnectionStatus,
): boolean {
  return CONNECTION_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to,
  );
}
