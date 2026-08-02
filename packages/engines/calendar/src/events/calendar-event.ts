/**
 * Calendar Engine Boundary — business events and temporal references
 * (not usage intents, free/busy rules, participants, commerce, or notices).
 *
 * @see DEC-CALENDAR-BOUNDARY-001
 * @see DEC-EXPERIENCE-BOUNDARY-001
 */

/** Internal calendar event kinds — not offerings or asset SKUs. */
export const CALENDAR_EVENT_KINDS = {
  /** Social or general timed event. */
  Event: "calendar.event",
  /** Class / session occurrence. */
  Session: "calendar.session",
  /** Recurring or patterned activity occurrence. */
  Activity: "calendar.activity",
  /** Competition occurrence. */
  Tournament: "calendar.tournament",
  /** Technical closure / maintenance occurrence. */
  Maintenance: "calendar.maintenance",
  /**
   * Event initiated by a Calendar system operation.
   * Not a technical infrastructure error.
   */
  Operational: "calendar.operational",
} as const;

export type CalendarEventKind =
  (typeof CALENDAR_EVENT_KINDS)[keyof typeof CALENDAR_EVENT_KINDS];

export const CALENDAR_EVENT_KIND_VALUES = Object.values(
  CALENDAR_EVENT_KINDS,
) as readonly CalendarEventKind[];

/** Calendar event status — not usage-intent or commerce state. */
export const CALENDAR_EVENT_STATUSES = {
  Draft: "draft",
  Scheduled: "scheduled",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type CalendarEventStatus =
  (typeof CALENDAR_EVENT_STATUSES)[keyof typeof CALENDAR_EVENT_STATUSES];

export const CALENDAR_EVENT_STATUS_VALUES = Object.values(
  CALENDAR_EVENT_STATUSES,
) as readonly CalendarEventStatus[];

/**
 * Opaque calendar event — what occurs and when.
 * No secrets, credential material, or commerce fields.
 */
export interface CalendarEvent {
  /** Opaque unique event reference. */
  eventReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal event kind. */
  eventKind: CalendarEventKind;
  /** Event status. */
  eventStatus: CalendarEventStatus;
  /** Opaque display-name pointer — not live localized copy. */
  nameReference?: string;
  /** Opaque description pointer — not live localized copy. */
  descriptionReference?: string;
  /** Opaque experience pointer — not a live offering graph. */
  experienceReference?: string;
  /** Opaque resource pointer — not a live asset graph. */
  resourceReference?: string;
  /** Opaque community pointer — not a live group graph. */
  communityReference?: string;
  /** Opaque start pointer — not a live clock query. */
  startReference?: string;
  /** Opaque end pointer — not a live clock query. */
  endReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future calendar adapters (Runtime).
 * Not wired in this foundation — no external sync, notices, or cron.
 */
export interface CalendarPort {
  createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEvent>;
  resolveCalendarEvent(event: CalendarEvent): Promise<CalendarEvent>;
}

export interface CreateCalendarEventInput {
  tenantReference: string;
  eventKind: CalendarEventKind;
  eventStatus?: CalendarEventStatus;
  eventReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  experienceReference?: string;
  resourceReference?: string;
  communityReference?: string;
  startReference?: string;
  endReference?: string;
  metadata?: Record<string, unknown>;
}

export function isCalendarEventKind(value: string): value is CalendarEventKind {
  return (CALENDAR_EVENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isCalendarEventStatus(
  value: string,
): value is CalendarEventStatus {
  return (CALENDAR_EVENT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isCalendarEvent(value: unknown): value is CalendarEvent {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const experienceOk =
    candidate.experienceReference === undefined ||
    (typeof candidate.experienceReference === "string" &&
      candidate.experienceReference.length > 0);
  const resourceOk =
    candidate.resourceReference === undefined ||
    (typeof candidate.resourceReference === "string" &&
      candidate.resourceReference.length > 0);
  const communityOk =
    candidate.communityReference === undefined ||
    (typeof candidate.communityReference === "string" &&
      candidate.communityReference.length > 0);
  const startOk =
    candidate.startReference === undefined ||
    (typeof candidate.startReference === "string" &&
      candidate.startReference.length > 0);
  const endOk =
    candidate.endReference === undefined ||
    (typeof candidate.endReference === "string" &&
      candidate.endReference.length > 0);
  return (
    typeof candidate.eventReference === "string" &&
    candidate.eventReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    experienceOk &&
    resourceOk &&
    communityOk &&
    startOk &&
    endOk &&
    typeof candidate.eventKind === "string" &&
    isCalendarEventKind(candidate.eventKind) &&
    typeof candidate.eventStatus === "string" &&
    isCalendarEventStatus(candidate.eventStatus)
  );
}

export function isCalendarPort(value: unknown): value is CalendarPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CalendarPort).createCalendarEvent === "function" &&
    typeof (value as CalendarPort).resolveCalendarEvent === "function"
  );
}
