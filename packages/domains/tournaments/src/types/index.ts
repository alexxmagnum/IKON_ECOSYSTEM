/**
 * TOURNAMENT + Tournament Entry statuses from docs/rules/state-machines.md §5
 * and docs/43_TOURNAMENTS_MODULE.md.
 */

/** Canonical TOURNAMENT machine statuses. */
export const TOURNAMENT_STATUSES = [
  "Draft",
  "Published",
  "RegistrationOpen",
  "RegistrationClosed",
  "Scheduled",
  "Running",
  "Finished",
  "Archived",
  "Cancelled",
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const TOURNAMENT_FINAL_STATUSES = [
  "Finished",
  "Archived",
  "Cancelled",
] as const satisfies readonly TournamentStatus[];

export type TournamentFinalStatus = (typeof TOURNAMENT_FINAL_STATUSES)[number];

/**
 * Tournament Entry / participant registration statuses (docs/43).
 * Not a ranking or scoring engine.
 */
export const TOURNAMENT_PARTICIPANT_STATUSES = [
  "Pending",
  "Confirmed",
  "Waitlisted",
  "Cancelled",
  "Validated",
] as const;

export type TournamentParticipantStatus =
  (typeof TOURNAMENT_PARTICIPANT_STATUSES)[number];

/** Match subprocess statuses (docs/43) — types only, no match engine. */
export const TOURNAMENT_MATCH_STATUSES = [
  "Pending",
  "Scheduled",
  "InProgress",
  "Finished",
  "Suspended",
] as const;

export type TournamentMatchStatus = (typeof TOURNAMENT_MATCH_STATUSES)[number];

/** Canonical TOURNAMENT transition events (state-machines.md). */
export const TOURNAMENT_EVENTS = [
  "tournament.published",
  "tournament.cancelled",
  "tournament.registration_opened",
  "tournament.registration_closed",
  "tournament.capacity_reached",
  "tournament.brackets_published",
  "tournament.started",
  "tournament.finished",
  "tournament.archived",
] as const;

export type TournamentLifecycleEvent = (typeof TOURNAMENT_EVENTS)[number];

export const TOURNAMENT_TRANSITIONS: ReadonlyArray<{
  from: TournamentStatus;
  to: TournamentStatus;
  event: TournamentLifecycleEvent;
}> = [
  { from: "Draft", to: "Published", event: "tournament.published" },
  { from: "Draft", to: "Cancelled", event: "tournament.cancelled" },
  {
    from: "Published",
    to: "RegistrationOpen",
    event: "tournament.registration_opened",
  },
  { from: "Published", to: "Cancelled", event: "tournament.cancelled" },
  {
    from: "RegistrationOpen",
    to: "RegistrationClosed",
    event: "tournament.registration_closed",
  },
  {
    from: "RegistrationOpen",
    to: "RegistrationClosed",
    event: "tournament.capacity_reached",
  },
  { from: "RegistrationOpen", to: "Cancelled", event: "tournament.cancelled" },
  {
    from: "RegistrationClosed",
    to: "Scheduled",
    event: "tournament.brackets_published",
  },
  { from: "RegistrationClosed", to: "Running", event: "tournament.started" },
  {
    from: "RegistrationClosed",
    to: "Cancelled",
    event: "tournament.cancelled",
  },
  { from: "Scheduled", to: "Running", event: "tournament.started" },
  { from: "Scheduled", to: "Cancelled", event: "tournament.cancelled" },
  { from: "Running", to: "Finished", event: "tournament.finished" },
  { from: "Running", to: "Cancelled", event: "tournament.cancelled" },
  { from: "Finished", to: "Archived", event: "tournament.archived" },
  { from: "Cancelled", to: "Archived", event: "tournament.archived" },
];

export function isTournamentStatus(value: string): value is TournamentStatus {
  return (TOURNAMENT_STATUSES as readonly string[]).includes(value);
}

export function isTournamentParticipantStatus(
  value: string,
): value is TournamentParticipantStatus {
  return (TOURNAMENT_PARTICIPANT_STATUSES as readonly string[]).includes(value);
}

export function isTournamentFinal(status: TournamentStatus): boolean {
  return (TOURNAMENT_FINAL_STATUSES as readonly TournamentStatus[]).includes(
    status,
  );
}

export function canTransitionTournament(
  from: TournamentStatus,
  to: TournamentStatus,
  event: TournamentLifecycleEvent,
): boolean {
  return TOURNAMENT_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to && edge.event === event,
  );
}
