/**
 * Hospitality Activity Schedule — when an activity occurs within a business.
 * Separates Activity (what) from Schedule (when) and Participation (who).
 *
 * @see DEC-HOSPITALITY-ACTIVITY-SCHEDULING-CONTEXT-001
 */

/** Internal schedule kinds — temporal planning, not holds or external agendas. */
export const SCHEDULE_KINDS = {
  /** Normal activity timing. */
  Activity: "schedule.activity",
  /** Occasion-oriented timing. */
  Event: "schedule.event",
  /** Repeated activity timing. */
  Recurring: "schedule.recurring",
  /** Internal MotanOS hospitality schedule. */
  Internal: "schedule.internal",
} as const;

export type ScheduleKind =
  (typeof SCHEDULE_KINDS)[keyof typeof SCHEDULE_KINDS];

export const SCHEDULE_KIND_VALUES = Object.values(
  SCHEDULE_KINDS,
) as readonly ScheduleKind[];

/** Schedule lifecycle status (existence labels only — no publish runtime). */
export const SCHEDULE_STATUSES = {
  Draft: "draft",
  Planned: "planned",
  Published: "published",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type ScheduleStatus =
  (typeof SCHEDULE_STATUSES)[keyof typeof SCHEDULE_STATUSES];

export const SCHEDULE_STATUS_VALUES = Object.values(
  SCHEDULE_STATUSES,
) as readonly ScheduleStatus[];

/**
 * Opaque hospitality activity schedule — temporal plan existence only.
 * Start/end/zone live behind opaque refs (no clock primitives in this domain).
 * No seat hold, till, alert, external agenda, or score payloads.
 */
export type HospitalityActivitySchedule = {
  /** Opaque unique schedule reference. */
  scheduleReference: string;
  /** Internal schedule kind. */
  scheduleKind: ScheduleKind;
  /** Schedule status. */
  scheduleStatus: ScheduleStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque start-moment pointer when known. */
  startReference?: string;
  /** Opaque end-moment pointer when known. */
  endReference?: string;
  /** Opaque timezone pointer when known. */
  timezoneReference?: string;
  /** Opaque parent schedule pointer when nested. */
  parentScheduleReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future activity-schedule adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface ActivitySchedulePort {
  createActivitySchedule(
    input: CreateActivityScheduleInput,
  ): Promise<HospitalityActivitySchedule>;
  resolveActivitySchedule(
    schedule: HospitalityActivitySchedule,
  ): Promise<HospitalityActivitySchedule>;
}

export type CreateActivityScheduleInput = {
  scheduleKind: ScheduleKind;
  scheduleStatus?: ScheduleStatus;
  scheduleReference?: string;
  hospitalityReference?: string;
  activityReference?: string;
  contextReference?: string;
  locationReference?: string;
  startReference?: string;
  endReference?: string;
  timezoneReference?: string;
  parentScheduleReference?: string;
  metadata?: Record<string, unknown>;
};

export function isScheduleKind(value: string): value is ScheduleKind {
  return (SCHEDULE_KIND_VALUES as readonly string[]).includes(value);
}

export function isScheduleStatus(value: string): value is ScheduleStatus {
  return (SCHEDULE_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isHospitalityActivitySchedule(
  value: unknown,
): value is HospitalityActivitySchedule {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.scheduleReference === "string" &&
    candidate.scheduleReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "startReference") &&
    optionalOpaqueOk(candidate, "endReference") &&
    optionalOpaqueOk(candidate, "timezoneReference") &&
    optionalOpaqueOk(candidate, "parentScheduleReference") &&
    typeof candidate.scheduleKind === "string" &&
    isScheduleKind(candidate.scheduleKind) &&
    typeof candidate.scheduleStatus === "string" &&
    isScheduleStatus(candidate.scheduleStatus)
  );
}

export function isActivitySchedulePort(
  value: unknown,
): value is ActivitySchedulePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ActivitySchedulePort).createActivitySchedule ===
      "function" &&
    typeof (value as ActivitySchedulePort).resolveActivitySchedule ===
      "function"
  );
}
