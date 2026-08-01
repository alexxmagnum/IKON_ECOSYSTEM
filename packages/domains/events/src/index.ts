/**
 * @motanos/domain-events — Events Domain Module foundation.
 *
 * MotanOS Core → Shared Engines → Domain Modules → Events
 *
 * Consumes Booking and Payments types. Does not implement those engines.
 * Must not depend on customer branding packages, auth, database, or gateways.
 */

export const EVENTS_DOMAIN = "@motanos/domain-events" as const;

export type {
  EventCategory,
  EventCategoryId,
} from "./domain/category";

export type {
  Event,
  EventId,
  EventSchedule,
  ExperienceRef,
} from "./domain/event";

export type {
  EventParticipant,
  EventParticipantId,
  ParticipantRef,
} from "./domain/participant";

export type {
  EventFinalStatus,
  EventLifecycleEvent,
  EventParticipantStatus,
  EventStatus,
} from "./types";
export {
  canTransitionEvent,
  EVENT_EVENTS,
  EVENT_FINAL_STATUSES,
  EVENT_PARTICIPANT_STATUSES,
  EVENT_STATUSES,
  EVENT_TRANSITIONS,
  isEventFinal,
  isEventParticipantStatus,
  isEventStatus,
} from "./types";

export type {
  AttachEventBookingReferenceInput,
  AttachEventPaymentReferenceInput,
  AttachEventResourceReferenceInput,
  CreateEventCategoryInput,
  CreateEventInput,
  EventCategoryResult,
  EventParticipantResult,
  EventResult,
  ListEventParticipantsQuery,
  ListEventsQuery,
  RegisterEventParticipantInput,
  UpdateEventParticipantStatusInput,
  UpdateEventStatusInput,
} from "./contracts";

export type {
  EventCategoryService,
  EventParticipantService,
  EventService,
} from "./services";
