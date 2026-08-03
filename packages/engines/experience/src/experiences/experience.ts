/**
 * Experience Engine Boundary — business experience existence / context / lifecycle
 * (not UI surfaces, step runners, suggestion engines, or signal packages).
 *
 * @see DEC-EXPERIENCE-BOUNDARY-001
 */

/** Internal experience kinds — not vendor experience catalogs. */
export const EXPERIENCE_KINDS = {
  /** End-customer facing experience. */
  Customer: "experience.customer",
  /** Member-facing experience. */
  Member: "experience.member",
  /** Booking-oriented experience. */
  Booking: "experience.booking",
  /** Event-oriented experience. */
  Event: "experience.event",
  /**
   * Experience initiated by an Experience system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "experience.operational",
  /** Commercial / business experience. */
  Business: "experience.business",
} as const;

export type ExperienceKind =
  (typeof EXPERIENCE_KINDS)[keyof typeof EXPERIENCE_KINDS];

export const EXPERIENCE_KIND_VALUES = Object.values(
  EXPERIENCE_KINDS,
) as readonly ExperienceKind[];

/** Experience status — not runner or suggestion pipeline state. */
export const EXPERIENCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ExperienceStatus =
  (typeof EXPERIENCE_STATUSES)[keyof typeof EXPERIENCE_STATUSES];

export const EXPERIENCE_STATUS_VALUES = Object.values(
  EXPERIENCE_STATUSES,
) as readonly ExperienceStatus[];

/**
 * Opaque experience — business experience existence only.
 * No credential material or live peer-engine payloads.
 */
export interface Experience {
  /** Opaque unique experience reference. */
  experienceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal experience kind. */
  experienceKind: ExperienceKind;
  /** Experience status. */
  experienceStatus: ExperienceStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque owner pointer when known — not a live actor profile. */
  ownerReference?: string;
  /** Opaque parent experience pointer when nested. */
  parentExperienceReference?: string;
  /** Opaque asset pointer when known. */
  assetReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future experience adapters (Runtime).
 * Not wired in this foundation — no run, suggest, or forecast methods.
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
  contextReference?: string;
  ownerReference?: string;
  parentExperienceReference?: string;
  assetReference?: string;
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
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentExperienceReference === undefined ||
    (typeof candidate.parentExperienceReference === "string" &&
      candidate.parentExperienceReference.length > 0);
  const assetOk =
    candidate.assetReference === undefined ||
    (typeof candidate.assetReference === "string" &&
      candidate.assetReference.length > 0);
  return (
    typeof candidate.experienceReference === "string" &&
    candidate.experienceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    contextOk &&
    ownerOk &&
    parentOk &&
    assetOk &&
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
