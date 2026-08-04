/**
 * Hospitality Staff Member — operative person/actor linked to a hospitality business.
 * Bridges Core Identity/Actor/Membership refs into Smart Table operations (existence only).
 *
 * @see DEC-HOSPITALITY-STAFF-CONTEXT-001
 */

/** Internal staff kinds — operative functions, not payroll/HR concepts. */
export const STAFF_KINDS = {
  /** Management / ownership floor role. */
  Management: "staff.management",
  /** Front-of-house service role. */
  Service: "staff.service",
  /** Kitchen operative role. */
  Kitchen: "staff.kitchen",
  /** Bar operative role. */
  Bar: "staff.bar",
  /** Host / reception operative role. */
  Host: "staff.host",
  /** Internal MotanOS hospitality staff. */
  Internal: "staff.internal",
} as const;

export type StaffKind = (typeof STAFF_KINDS)[keyof typeof STAFF_KINDS];

export const STAFF_KIND_VALUES = Object.values(
  STAFF_KINDS,
) as readonly StaffKind[];

/** Staff member status. */
export const STAFF_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type StaffStatus =
  (typeof STAFF_STATUSES)[keyof typeof STAFF_STATUSES];

export const STAFF_STATUS_VALUES = Object.values(
  STAFF_STATUSES,
) as readonly StaffStatus[];

/**
 * Opaque hospitality staff member — operative link existence only.
 * No system user, auth account, payroll, shift, or contract payloads.
 */
export type HospitalityStaffMember = {
  /** Opaque unique staff reference. */
  staffReference: string;
  /** Internal staff kind. */
  staffKind: StaffKind;
  /** Staff status. */
  staffStatus: StaffStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque Core Actor pointer when known. */
  actorReference?: string;
  /** Opaque Core Membership pointer when known. */
  membershipReference?: string;
  /** Opaque role pointer when known (Permissions / Membership — no Role Engine). */
  roleReference?: string;
  /** Opaque floor-area pointer when known. */
  areaReference?: string;
  /** Opaque parent staff pointer when nested. */
  parentStaffReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future staff adapters.
 * Not wired in this foundation — no shift / payroll / clock methods.
 */
export interface StaffPort {
  createStaffMember(
    input: CreateStaffMemberInput,
  ): Promise<HospitalityStaffMember>;
  resolveStaffMember(
    staff: HospitalityStaffMember,
  ): Promise<HospitalityStaffMember>;
}

export type CreateStaffMemberInput = {
  staffKind: StaffKind;
  staffStatus?: StaffStatus;
  staffReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  actorReference?: string;
  membershipReference?: string;
  roleReference?: string;
  areaReference?: string;
  parentStaffReference?: string;
  metadata?: Record<string, unknown>;
};

export function isStaffKind(value: string): value is StaffKind {
  return (STAFF_KIND_VALUES as readonly string[]).includes(value);
}

export function isStaffStatus(value: string): value is StaffStatus {
  return (STAFF_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityStaffMember(
  value: unknown,
): value is HospitalityStaffMember {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.staffReference === "string" &&
    candidate.staffReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "membershipReference") &&
    optionalOpaqueOk(candidate, "roleReference") &&
    optionalOpaqueOk(candidate, "areaReference") &&
    optionalOpaqueOk(candidate, "parentStaffReference") &&
    typeof candidate.staffKind === "string" &&
    isStaffKind(candidate.staffKind) &&
    typeof candidate.staffStatus === "string" &&
    isStaffStatus(candidate.staffStatus)
  );
}

export function isStaffPort(value: unknown): value is StaffPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as StaffPort).createStaffMember === "function" &&
    typeof (value as StaffPort).resolveStaffMember === "function"
  );
}
