/**
 * Hospitality Domain — vertical business context (“what hospitality business exists”)
 * (not Smart Table modules, tables, menus, or orders — those arrive later).
 *
 * @see DEC-HOSPITALITY-CONTEXT-001
 */

/** Internal hospitality kinds — restaurant / club / hotel verticals. */
export const HOSPITALITY_KINDS = {
  /** Restaurant business. */
  Restaurant: "hospitality.restaurant",
  /** Club / beach-club / gastronomic club business. */
  Club: "hospitality.club",
  /** Hotel with food & beverage hospitality. */
  Hotel: "hospitality.hotel",
  /** Bar business. */
  Bar: "hospitality.bar",
  /** Catering business. */
  Catering: "hospitality.catering",
  /** Internal MotanOS hospitality tenant. */
  Internal: "hospitality.internal",
} as const;

export type HospitalityKind =
  (typeof HOSPITALITY_KINDS)[keyof typeof HOSPITALITY_KINDS];

export const HOSPITALITY_KIND_VALUES = Object.values(
  HOSPITALITY_KINDS,
) as readonly HospitalityKind[];

/** Hospitality business status. */
export const HOSPITALITY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type HospitalityStatus =
  (typeof HOSPITALITY_STATUSES)[keyof typeof HOSPITALITY_STATUSES];

export const HOSPITALITY_STATUS_VALUES = Object.values(
  HOSPITALITY_STATUSES,
) as readonly HospitalityStatus[];

/**
 * Opaque hospitality business — vertical domain existence only.
 * No tables, menus, orders, staff, or kitchen payloads in this foundation.
 */
export type HospitalityBusiness = {
  /** Opaque unique hospitality reference. */
  hospitalityReference: string;
  /** Internal hospitality kind. */
  hospitalityKind: HospitalityKind;
  /** Hospitality status. */
  hospitalityStatus: HospitalityStatus;
  /** Opaque tenant pointer when known. */
  tenantReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque organization pointer when known. */
  organizationReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque brand pointer when known. */
  brandReference?: string;
  /** Opaque parent hospitality pointer when nested. */
  parentHospitalityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future hospitality adapters.
 * Not wired in this foundation — no table / menu / order methods.
 */
export interface HospitalityPort {
  createHospitality(
    input: CreateHospitalityInput,
  ): Promise<HospitalityBusiness>;
  resolveHospitality(
    hospitality: HospitalityBusiness,
  ): Promise<HospitalityBusiness>;
}

export type CreateHospitalityInput = {
  hospitalityKind: HospitalityKind;
  hospitalityStatus?: HospitalityStatus;
  hospitalityReference?: string;
  tenantReference?: string;
  contextReference?: string;
  organizationReference?: string;
  locationReference?: string;
  brandReference?: string;
  parentHospitalityReference?: string;
  metadata?: Record<string, unknown>;
};

export function isHospitalityKind(value: string): value is HospitalityKind {
  return (HOSPITALITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isHospitalityStatus(
  value: string,
): value is HospitalityStatus {
  return (HOSPITALITY_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityBusiness(
  value: unknown,
): value is HospitalityBusiness {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.hospitalityReference === "string" &&
    candidate.hospitalityReference.length > 0 &&
    optionalOpaqueOk(candidate, "tenantReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "organizationReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "brandReference") &&
    optionalOpaqueOk(candidate, "parentHospitalityReference") &&
    typeof candidate.hospitalityKind === "string" &&
    isHospitalityKind(candidate.hospitalityKind) &&
    typeof candidate.hospitalityStatus === "string" &&
    isHospitalityStatus(candidate.hospitalityStatus)
  );
}

export function isHospitalityPort(value: unknown): value is HospitalityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as HospitalityPort).createHospitality === "function" &&
    typeof (value as HospitalityPort).resolveHospitality === "function"
  );
}
