/**
 * Golf domain operational statuses.
 * SoT does not define a dedicated GOLF_ROUND machine; these statuses describe
 * the sports lifecycle of a round while tee-time reservation stays on BOOKING.
 */

export const GOLF_ROUND_STATUSES = [
  "Scheduled",
  "InProgress",
  "Completed",
  "Cancelled",
] as const;

export type GolfRoundStatus = (typeof GOLF_ROUND_STATUSES)[number];

export const GOLF_ROUND_FINAL_STATUSES = [
  "Completed",
  "Cancelled",
] as const satisfies readonly GolfRoundStatus[];

export type GolfRoundFinalStatus = (typeof GOLF_ROUND_FINAL_STATUSES)[number];

export function isGolfRoundStatus(value: string): value is GolfRoundStatus {
  return (GOLF_ROUND_STATUSES as readonly string[]).includes(value);
}

export function isGolfRoundFinal(status: GolfRoundStatus): boolean {
  return (GOLF_ROUND_FINAL_STATUSES as readonly GolfRoundStatus[]).includes(
    status,
  );
}

/** Valid simple transitions for a golf round sports lifecycle. */
export const GOLF_ROUND_TRANSITIONS: ReadonlyArray<{
  from: GolfRoundStatus;
  to: GolfRoundStatus;
}> = [
  { from: "Scheduled", to: "InProgress" },
  { from: "Scheduled", to: "Cancelled" },
  { from: "InProgress", to: "Completed" },
  { from: "InProgress", to: "Cancelled" },
];

export function canTransitionGolfRound(
  from: GolfRoundStatus,
  to: GolfRoundStatus,
): boolean {
  if (isGolfRoundFinal(from)) {
    return false;
  }
  return GOLF_ROUND_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to,
  );
}
