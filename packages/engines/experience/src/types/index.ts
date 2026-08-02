/**
 * Experience Layer statuses (DEC-EXPERIENCE-003 — provisional).
 * No official EXPERIENCE / JOURNEY machines in docs/rules/state-machines.md yet.
 */

export const EXPERIENCE_STATUSES = [
  "Draft",
  "Active",
  "Archived",
] as const;

export type ExperienceStatus = (typeof EXPERIENCE_STATUSES)[number];

export const JOURNEY_STATUSES = [
  "Planned",
  "InProgress",
  "Completed",
  "Cancelled",
] as const;

export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];

export const JOURNEY_FINAL_STATUSES = [
  "Completed",
  "Cancelled",
] as const satisfies readonly JourneyStatus[];

export type JourneyFinalStatus = (typeof JOURNEY_FINAL_STATUSES)[number];

export function isExperienceStatus(value: string): value is ExperienceStatus {
  return (EXPERIENCE_STATUSES as readonly string[]).includes(value);
}

export function isJourneyStatus(value: string): value is JourneyStatus {
  return (JOURNEY_STATUSES as readonly string[]).includes(value);
}

export function isJourneyFinal(status: JourneyStatus): boolean {
  return (JOURNEY_FINAL_STATUSES as readonly JourneyStatus[]).includes(status);
}

export const JOURNEY_TRANSITIONS: ReadonlyArray<{
  from: JourneyStatus;
  to: JourneyStatus;
}> = [
  { from: "Planned", to: "InProgress" },
  { from: "Planned", to: "Cancelled" },
  { from: "InProgress", to: "Completed" },
  { from: "InProgress", to: "Cancelled" },
];

export function canTransitionJourney(
  from: JourneyStatus,
  to: JourneyStatus,
): boolean {
  if (isJourneyFinal(from)) {
    return false;
  }
  return JOURNEY_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to,
  );
}
