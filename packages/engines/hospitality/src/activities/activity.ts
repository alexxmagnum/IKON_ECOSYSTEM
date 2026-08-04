/**
 * Hospitality Activity — organized experience within a hospitality business.
 * Foundation: Community → Activity → future participation (existence only).
 *
 * @see DEC-HOSPITALITY-ACTIVITY-CONTEXT-001
 */

/** Internal activity kinds — hospitality-scoped experiences, not horizontal calendars. */
export const ACTIVITY_KINDS = {
  /** Created by the hospitality business. */
  Business: "activity.business",
  /** Proposed by community members. */
  Community: "activity.community",
  /** Occasion-oriented activity. */
  Event: "activity.event",
  /** Sport-oriented activity. */
  Sport: "activity.sport",
  /** Social gathering-oriented activity. */
  Social: "activity.social",
  /** Internal MotanOS hospitality activity. */
  Internal: "activity.internal",
} as const;

export type ActivityKind =
  (typeof ACTIVITY_KINDS)[keyof typeof ACTIVITY_KINDS];

export const ACTIVITY_KIND_VALUES = Object.values(
  ACTIVITY_KINDS,
) as readonly ActivityKind[];

/** Activity lifecycle status (existence labels only — no approval runtime). */
export const ACTIVITY_STATUSES = {
  Draft: "draft",
  Proposed: "proposed",
  Review: "review",
  Approved: "approved",
  Published: "published",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type ActivityStatus =
  (typeof ACTIVITY_STATUSES)[keyof typeof ACTIVITY_STATUSES];

export const ACTIVITY_STATUS_VALUES = Object.values(
  ACTIVITY_STATUSES,
) as readonly ActivityStatus[];

/**
 * Opaque hospitality activity — organized experience existence only.
 * No schedule engine, seat hold, till, alert, badge, or score payloads.
 */
export type HospitalityActivity = {
  /** Opaque unique activity reference. */
  activityReference: string;
  /** Internal activity kind. */
  activityKind: ActivityKind;
  /** Activity status. */
  activityStatus: ActivityStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque creator pointer when known. */
  creatorReference?: string;
  /** Opaque proposal pointer when known. */
  proposalReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque reservation pointer when known. */
  reservationReference?: string;
  /** Opaque parent activity pointer when nested. */
  parentActivityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future activity adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface ActivityPort {
  createActivity(input: CreateActivityInput): Promise<HospitalityActivity>;
  resolveActivity(
    activity: HospitalityActivity,
  ): Promise<HospitalityActivity>;
}

export type CreateActivityInput = {
  activityKind: ActivityKind;
  activityStatus?: ActivityStatus;
  activityReference?: string;
  hospitalityReference?: string;
  communityReference?: string;
  contextReference?: string;
  creatorReference?: string;
  proposalReference?: string;
  locationReference?: string;
  reservationReference?: string;
  parentActivityReference?: string;
  metadata?: Record<string, unknown>;
};

export function isActivityKind(value: string): value is ActivityKind {
  return (ACTIVITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isActivityStatus(value: string): value is ActivityStatus {
  return (ACTIVITY_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityActivity(
  value: unknown,
): value is HospitalityActivity {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.activityReference === "string" &&
    candidate.activityReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "creatorReference") &&
    optionalOpaqueOk(candidate, "proposalReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "reservationReference") &&
    optionalOpaqueOk(candidate, "parentActivityReference") &&
    typeof candidate.activityKind === "string" &&
    isActivityKind(candidate.activityKind) &&
    typeof candidate.activityStatus === "string" &&
    isActivityStatus(candidate.activityStatus)
  );
}

export function isActivityPort(value: unknown): value is ActivityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ActivityPort).createActivity === "function" &&
    typeof (value as ActivityPort).resolveActivity === "function"
  );
}
