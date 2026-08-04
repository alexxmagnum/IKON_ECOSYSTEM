/**
 * Hospitality Visit Context — spatial / ambient setting of an on-site visit.
 * Bridge only: Visit Experience → Visit Context → future room / ticket ops.
 *
 * @see DEC-HOSPITALITY-VISIT-CONTEXT-CONTEXT-001
 */

/** Internal visit-context kinds — ambient setting, not rooms or till rails. */
export const VISIT_CONTEXT_KINDS = {
  /** General place. */
  Location: "context.location",
  /** Area within a place. */
  Area: "context.area",
  /** Specific zone. */
  Zone: "context.zone",
  /** Setting created for a concrete experience. */
  Experience: "context.experience",
  /** Internal MotanOS hospitality visit context. */
  Internal: "context.internal",
} as const;

export type VisitContextKind =
  (typeof VISIT_CONTEXT_KINDS)[keyof typeof VISIT_CONTEXT_KINDS];

export const VISIT_CONTEXT_KIND_VALUES = Object.values(
  VISIT_CONTEXT_KINDS,
) as readonly VisitContextKind[];

/** Visit-context lifecycle status (existence labels only — no room/ticket ops). */
export const VISIT_CONTEXT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Available: "available",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type VisitContextStatus =
  (typeof VISIT_CONTEXT_STATUSES)[keyof typeof VISIT_CONTEXT_STATUSES];

export const VISIT_CONTEXT_STATUS_VALUES = Object.values(
  VISIT_CONTEXT_STATUSES,
) as readonly VisitContextStatus[];

/**
 * Opaque hospitality visit context — ambient setting existence only.
 * No room, seat, or ticket pointers in this foundation.
 * No till, room bind, hold rails, alert, or score payloads.
 */
export type HospitalityVisitContext = {
  /** Opaque unique context reference. */
  contextReference: string;
  /** Internal visit-context kind. */
  contextKind: VisitContextKind;
  /** Visit-context status. */
  contextStatus: VisitContextStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque visit-experience pointer when known. */
  visitReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque area pointer when known. */
  areaReference?: string;
  /** Opaque zone pointer when known. */
  zoneReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque parent context pointer when nested. */
  parentContextReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future visit-context adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface VisitContextPort {
  createVisitContext(
    input: CreateVisitContextInput,
  ): Promise<HospitalityVisitContext>;
  resolveVisitContext(
    context: HospitalityVisitContext,
  ): Promise<HospitalityVisitContext>;
}

export type CreateVisitContextInput = {
  contextKind: VisitContextKind;
  contextStatus?: VisitContextStatus;
  contextReference?: string;
  hospitalityReference?: string;
  visitReference?: string;
  locationReference?: string;
  areaReference?: string;
  zoneReference?: string;
  experienceReference?: string;
  parentContextReference?: string;
  metadata?: Record<string, unknown>;
};

export function isVisitContextKind(value: string): value is VisitContextKind {
  return (VISIT_CONTEXT_KIND_VALUES as readonly string[]).includes(value);
}

export function isVisitContextStatus(
  value: string,
): value is VisitContextStatus {
  return (VISIT_CONTEXT_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityVisitContext(
  value: unknown,
): value is HospitalityVisitContext {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.contextReference === "string" &&
    candidate.contextReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "visitReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "areaReference") &&
    optionalOpaqueOk(candidate, "zoneReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "parentContextReference") &&
    typeof candidate.contextKind === "string" &&
    isVisitContextKind(candidate.contextKind) &&
    typeof candidate.contextStatus === "string" &&
    isVisitContextStatus(candidate.contextStatus)
  );
}

export function isVisitContextPort(value: unknown): value is VisitContextPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as VisitContextPort).createVisitContext === "function" &&
    typeof (value as VisitContextPort).resolveVisitContext === "function"
  );
}
