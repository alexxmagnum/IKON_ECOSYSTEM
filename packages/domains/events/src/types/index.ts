/**
 * EVENT + Event Registration statuses from docs/rules/state-machines.md §4
 * and docs/42_EVENTS_MODULE.md.
 */

/** Canonical EVENT machine statuses. */
export const EVENT_STATUSES = [
  "Draft",
  "Published",
  "RegistrationOpen",
  "RegistrationClosed",
  "Running",
  "Finished",
  "Cancelled",
  "Archived",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_FINAL_STATUSES = [
  "Finished",
  "Cancelled",
  "Archived",
] as const satisfies readonly EventStatus[];

export type EventFinalStatus = (typeof EVENT_FINAL_STATUSES)[number];

/**
 * Event registration / participant statuses (docs/42_EVENTS_MODULE).
 * Not a full social system — registration lifecycle only.
 */
export const EVENT_PARTICIPANT_STATUSES = [
  "Pending",
  "Confirmed",
  "Waitlisted",
  "CheckedIn",
  "Attended",
  "NoShow",
  "Cancelled",
] as const;

export type EventParticipantStatus =
  (typeof EVENT_PARTICIPANT_STATUSES)[number];

/** Canonical EVENT transition events (state-machines.md). */
export const EVENT_EVENTS = [
  "event.published",
  "event.cancelled",
  "event.registration_opened",
  "event.registration_closed",
  "event.capacity_reached",
  "event.started",
  "event.finished",
  "event.archived",
] as const;

export type EventLifecycleEvent = (typeof EVENT_EVENTS)[number];

export const EVENT_TRANSITIONS: ReadonlyArray<{
  from: EventStatus;
  to: EventStatus;
  event: EventLifecycleEvent;
}> = [
  { from: "Draft", to: "Published", event: "event.published" },
  { from: "Draft", to: "Cancelled", event: "event.cancelled" },
  {
    from: "Published",
    to: "RegistrationOpen",
    event: "event.registration_opened",
  },
  { from: "Published", to: "Cancelled", event: "event.cancelled" },
  {
    from: "RegistrationOpen",
    to: "RegistrationClosed",
    event: "event.registration_closed",
  },
  {
    from: "RegistrationOpen",
    to: "RegistrationClosed",
    event: "event.capacity_reached",
  },
  { from: "RegistrationOpen", to: "Running", event: "event.started" },
  { from: "RegistrationOpen", to: "Cancelled", event: "event.cancelled" },
  { from: "RegistrationClosed", to: "Running", event: "event.started" },
  { from: "RegistrationClosed", to: "Cancelled", event: "event.cancelled" },
  { from: "Running", to: "Finished", event: "event.finished" },
  { from: "Running", to: "Cancelled", event: "event.cancelled" },
  { from: "Finished", to: "Archived", event: "event.archived" },
  { from: "Cancelled", to: "Archived", event: "event.archived" },
];

export function isEventStatus(value: string): value is EventStatus {
  return (EVENT_STATUSES as readonly string[]).includes(value);
}

export function isEventParticipantStatus(
  value: string,
): value is EventParticipantStatus {
  return (EVENT_PARTICIPANT_STATUSES as readonly string[]).includes(value);
}

export function isEventFinal(status: EventStatus): boolean {
  return (EVENT_FINAL_STATUSES as readonly EventStatus[]).includes(status);
}

export function canTransitionEvent(
  from: EventStatus,
  to: EventStatus,
  event: EventLifecycleEvent,
): boolean {
  return EVENT_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to && edge.event === event,
  );
}
