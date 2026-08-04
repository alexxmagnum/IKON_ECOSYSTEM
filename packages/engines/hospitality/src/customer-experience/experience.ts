/**
 * Hospitality Customer Experience — guest-facing experience within a hospitality business.
 * Conceptual layer: Guest → Hospitality → Experience → Operation (existence only).
 *
 * @see DEC-HOSPITALITY-CUSTOMER-EXPERIENCE-CONTEXT-001
 */

/** Internal experience kinds — guest touchpoints, not sales-desk or portal products. */
export const EXPERIENCE_KINDS = {
  /** Discovery / find-hospitality touchpoint. */
  Discovery: "experience.discovery",
  /** Digital menu touchpoint. */
  Menu: "experience.menu",
  /** Reservation touchpoint. */
  Reservation: "experience.reservation",
  /** Ordering touchpoint. */
  Order: "experience.order",
  /** On-site visit touchpoint. */
  Visit: "experience.visit",
  /** Member / club touchpoint. */
  Member: "experience.member",
  /** Internal MotanOS hospitality experience. */
  Internal: "experience.internal",
} as const;

export type ExperienceKind =
  (typeof EXPERIENCE_KINDS)[keyof typeof EXPERIENCE_KINDS];

export const EXPERIENCE_KIND_VALUES = Object.values(
  EXPERIENCE_KINDS,
) as readonly ExperienceKind[];

/** Experience lifecycle status (existence labels only — no journey engine). */
export const EXPERIENCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Available: "available",
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
 * Opaque hospitality customer experience — guest touchpoint existence only.
 * No guest vault, sales funnel, campaign, sign-in, till, alert, or UI payloads.
 */
export type HospitalityCustomerExperience = {
  /** Opaque unique experience reference. */
  experienceReference: string;
  /** Internal experience kind. */
  experienceKind: ExperienceKind;
  /** Experience status. */
  experienceStatus: ExperienceStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque reservation pointer when known. */
  reservationReference?: string;
  /** Opaque order pointer when known. */
  orderReference?: string;
  /** Opaque menu pointer when known. */
  menuReference?: string;
  /** Opaque table pointer when known. */
  tableReference?: string;
  /** Opaque channel pointer when known. */
  channelReference?: string;
  /** Opaque parent experience pointer when nested. */
  parentExperienceReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future customer-experience adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface CustomerExperiencePort {
  createExperience(
    input: CreateExperienceInput,
  ): Promise<HospitalityCustomerExperience>;
  resolveExperience(
    experience: HospitalityCustomerExperience,
  ): Promise<HospitalityCustomerExperience>;
}

export type CreateExperienceInput = {
  experienceKind: ExperienceKind;
  experienceStatus?: ExperienceStatus;
  experienceReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  actorReference?: string;
  reservationReference?: string;
  orderReference?: string;
  menuReference?: string;
  tableReference?: string;
  channelReference?: string;
  parentExperienceReference?: string;
  metadata?: Record<string, unknown>;
};

export function isExperienceKind(value: string): value is ExperienceKind {
  return (EXPERIENCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isExperienceStatus(value: string): value is ExperienceStatus {
  return (EXPERIENCE_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityCustomerExperience(
  value: unknown,
): value is HospitalityCustomerExperience {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.experienceReference === "string" &&
    candidate.experienceReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "reservationReference") &&
    optionalOpaqueOk(candidate, "orderReference") &&
    optionalOpaqueOk(candidate, "menuReference") &&
    optionalOpaqueOk(candidate, "tableReference") &&
    optionalOpaqueOk(candidate, "channelReference") &&
    optionalOpaqueOk(candidate, "parentExperienceReference") &&
    typeof candidate.experienceKind === "string" &&
    isExperienceKind(candidate.experienceKind) &&
    typeof candidate.experienceStatus === "string" &&
    isExperienceStatus(candidate.experienceStatus)
  );
}

export function isCustomerExperiencePort(
  value: unknown,
): value is CustomerExperiencePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CustomerExperiencePort).createExperience ===
      "function" &&
    typeof (value as CustomerExperiencePort).resolveExperience ===
      "function"
  );
}
