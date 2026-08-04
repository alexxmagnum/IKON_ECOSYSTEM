/**
 * @motanos/event — Event Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/event
 *
 * Event = what domain occurrence exists.
 * Must not depend on recorded-fact packages, process-flow packages,
 * communication packages, metrics packages, or live technical engines.
 *
 * Distinct from legacy `@motanos/domain-events` domain scaffolding.
 *
 * @see DEC-EVENT-BOUNDARY-001
 */

export const EVENT_BOUNDARY = "@motanos/event" as const;

export type {
  CreateEventInput,
  CreateEventOptions,
  Event,
  EventKind,
  EventPort,
  EventStatus,
} from "./events";
export {
  EVENT_KINDS,
  EVENT_KIND_VALUES,
  EVENT_STATUSES,
  EVENT_STATUS_VALUES,
  createEvent,
  isEvent,
  isEventKind,
  isEventPort,
  isEventStatus,
  resetEventReferenceSequence,
} from "./events";
