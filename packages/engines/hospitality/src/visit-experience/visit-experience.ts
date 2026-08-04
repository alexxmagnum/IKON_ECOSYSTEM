/**
 * Hospitality Visit Experience — on-site presence of an actor in a business.
 * Bridge only: Reservation Runtime → Visit Experience → future room / ticket ops.
 *
 * @see DEC-HOSPITALITY-VISIT-EXPERIENCE-CONTEXT-001
 */

/** Internal visit kinds — on-site presence, not tickets or till rails. */
export const VISIT_KINDS = {
  /** Presence tied to an activity. */
  Activity: "visit.activity",
  /** Presence tied to an occasion. */
  Event: "visit.event",
  /** Presence tied to a concrete session. */
  Session: "visit.session",
  /** General presence at the business. */
  General: "visit.general",
  /** Internal MotanOS hospitality visit. */
  Internal: "visit.internal",
} as const;

export type VisitKind = (typeof VISIT_KINDS)[keyof typeof VISIT_KINDS];

export const VISIT_KIND_VALUES = Object.values(
  VISIT_KINDS,
) as readonly VisitKind[];

/** Visit lifecycle status (existence labels only — no room/ticket/till ops). */
export const VISIT_STATUSES = {
  Draft: "draft",
  Expected: "expected",
  Arrived: "arrived",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
  Expired: "expired",
  Archived: "archived",
} as const;

export type VisitStatus =
  (typeof VISIT_STATUSES)[keyof typeof VISIT_STATUSES];

export const VISIT_STATUS_VALUES = Object.values(
  VISIT_STATUSES,
) as readonly VisitStatus[];

/**
 * Opaque hospitality visit experience — on-site presence existence only.
 * No room, ticket, or till pointers in this foundation.
 * No till, room bind, prep rails, alert, or score payloads.
 */
export type HospitalityVisitExperience = {
  /** Opaque unique visit reference. */
  visitReference: string;
  /** Internal visit kind. */
  visitKind: VisitKind;
  /** Visit status. */
  visitStatus: VisitStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque reservation-runtime pointer when known. */
  reservationReference?: string;
  /** Opaque booking-request pointer when known. */
  bookingReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque schedule pointer when known. */
  scheduleReference?: string;
  /** Opaque participation pointer when known. */
  participationReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque parent visit pointer when nested. */
  parentVisitReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future visit-experience adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface VisitExperiencePort {
  createVisitExperience(
    input: CreateVisitExperienceInput,
  ): Promise<HospitalityVisitExperience>;
  resolveVisitExperience(
    visit: HospitalityVisitExperience,
  ): Promise<HospitalityVisitExperience>;
}

export type CreateVisitExperienceInput = {
  visitKind: VisitKind;
  visitStatus?: VisitStatus;
  visitReference?: string;
  hospitalityReference?: string;
  reservationReference?: string;
  bookingReference?: string;
  activityReference?: string;
  scheduleReference?: string;
  participationReference?: string;
  actorReference?: string;
  locationReference?: string;
  contextReference?: string;
  parentVisitReference?: string;
  metadata?: Record<string, unknown>;
};

export function isVisitKind(value: string): value is VisitKind {
  return (VISIT_KIND_VALUES as readonly string[]).includes(value);
}

export function isVisitStatus(value: string): value is VisitStatus {
  return (VISIT_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityVisitExperience(
  value: unknown,
): value is HospitalityVisitExperience {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.visitReference === "string" &&
    candidate.visitReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "reservationReference") &&
    optionalOpaqueOk(candidate, "bookingReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "scheduleReference") &&
    optionalOpaqueOk(candidate, "participationReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "parentVisitReference") &&
    typeof candidate.visitKind === "string" &&
    isVisitKind(candidate.visitKind) &&
    typeof candidate.visitStatus === "string" &&
    isVisitStatus(candidate.visitStatus)
  );
}

export function isVisitExperiencePort(
  value: unknown,
): value is VisitExperiencePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as VisitExperiencePort).createVisitExperience ===
      "function" &&
    typeof (value as VisitExperiencePort).resolveVisitExperience ===
      "function"
  );
}
