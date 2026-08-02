/**
 * @motanos/calendar — Calendar Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/calendar
 *
 * Calendar = what occurs and when (event definition).
 * Offerings, assets, groups, usage intents, and free/busy rules live elsewhere.
 *
 * Must not depend on usage engines, free/busy engines, resource engines,
 * experience engines, community engines, commerce packages, auth packages,
 * or persistence vendors.
 *
 * @see DEC-CALENDAR-BOUNDARY-001
 */

export const CALENDAR_ENGINE = "@motanos/calendar" as const;

export type {
  CalendarEvent,
  CalendarEventKind,
  CalendarEventStatus,
  CalendarPort,
  CreateCalendarEventInput,
  CreateCalendarEventOptions,
} from "./events";
export {
  CALENDAR_EVENT_KINDS,
  CALENDAR_EVENT_KIND_VALUES,
  CALENDAR_EVENT_STATUSES,
  CALENDAR_EVENT_STATUS_VALUES,
  createCalendarEvent,
  isCalendarEvent,
  isCalendarEventKind,
  isCalendarEventStatus,
  isCalendarPort,
  resetCalendarEventReferenceSequence,
} from "./events";
