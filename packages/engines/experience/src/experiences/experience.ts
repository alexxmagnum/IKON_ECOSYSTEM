/**
 * Experience Engine Boundary — what a business offers to a community
 * (not Booking / Resource / Calendar Event / Community / Payment).
 *
 * @see DEC-EXPERIENCE-BOUNDARY-001
 * @see DEC-RESOURCE-BOUNDARY-001
 */

/** Internal experience kinds — not calendar events or booking slots. */
export const EXPERIENCE_KINDS = {
  /** Special offered event (e.g. tasting dinner). */
  Event: "experience.event",
  /** Recurring or one-off activity. */
  Activity: "experience.activity",
  /** Competition / tournament offering. */
  Tournament: "experience.tournament",
  /** Class / course offering. */
  Class: "experience.class",
  /** Premium or packaged service experience. */
  Service: "experience.service",
  /** Social offering among members. */
  Social: "experience.social",
  /**
   * Experience initiated by an Experience system operation.
   * Not a technical infrastructure error.
   */
  Operational: "experience.operational",
} as const;

export type ExperienceKind =
  (typeof EXPERIENCE_KINDS)[keyof typeof EXPERIENCE_KINDS];

export const EXPERIENCE_KIND_VALUES = Object.values(
  EXPERIENCE_KINDS,
) as readonly ExperienceKind[];

/** Experience offering status — not booking or calendar occurrence state. */
export const EXPERIENCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type ExperienceStatus =
  (typeof EXPERIENCE_STATUSES)[keyof typeof EXPERIENCE_STATUSES];

export const EXPERIENCE_STATUS_VALUES = Object.values(
  EXPERIENCE_STATUSES,
) as readonly ExperienceStatus[];

/**
 * Opaque experience offering definition.
 * No real users, PII, or payment data.
 */
export interface Experience {
  /** Opaque unique experience reference. */
  experienceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal experience kind. */
  experienceKind: ExperienceKind;
  /** Experience offering status. */
  experienceStatus: ExperienceStatus;
  /** Opaque display-name pointer — not live localized copy. */
  nameReference?: string;
  /** Opaque description pointer — not live localized copy. */
  descriptionReference?: string;
  /** Opaque associated resource — not a live Resource object. */
  resourceReference?: string;
  /** Opaque parent experience (hierarchy) — not a live graph query. */
  parentExperienceReference?: string;
  /** Opaque owner when known — not an identity profile. */
  ownerReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future experience adapters (Runtime).
 * Not wired in this foundation — no publish, booking, or charge flows.
 */
export interface ExperiencePort {
  createExperience(input: CreateExperienceInput): Promise<Experience>;
  resolveExperience(experience: Experience): Promise<Experience>;
}

export interface CreateExperienceInput {
  tenantReference: string;
  experienceKind: ExperienceKind;
  experienceStatus?: ExperienceStatus;
  experienceReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  resourceReference?: string;
  parentExperienceReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
}

export function isExperienceKind(value: string): value is ExperienceKind {
  return (EXPERIENCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isExperienceStatus(value: string): value is ExperienceStatus {
  return (EXPERIENCE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isExperience(value: unknown): value is Experience {
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
  const resourceOk =
    candidate.resourceReference === undefined ||
    (typeof candidate.resourceReference === "string" &&
      candidate.resourceReference.length > 0);
  const parentOk =
    candidate.parentExperienceReference === undefined ||
    (typeof candidate.parentExperienceReference === "string" &&
      candidate.parentExperienceReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  return (
    typeof candidate.experienceReference === "string" &&
    candidate.experienceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    resourceOk &&
    parentOk &&
    ownerOk &&
    typeof candidate.experienceKind === "string" &&
    isExperienceKind(candidate.experienceKind) &&
    typeof candidate.experienceStatus === "string" &&
    isExperienceStatus(candidate.experienceStatus)
  );
}

export function isExperiencePort(value: unknown): value is ExperiencePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ExperiencePort).createExperience === "function" &&
    typeof (value as ExperiencePort).resolveExperience === "function"
  );
}
