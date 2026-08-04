import type {
  CreateStaffMemberInput,
  HospitalityStaffMember,
  StaffKind,
  StaffStatus,
} from "./staff-member";
import {
  STAFF_STATUSES,
  isStaffKind,
  isStaffStatus,
} from "./staff-member";

let staffSequence = 0;

export interface CreateStaffMemberOptions {
  /**
   * When set, staff may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityStaffMember (in-memory — operative link only).
 * Does not create identities, open shifts, or run payroll / attendance flows.
 */
export function createStaffMember(
  input: CreateStaffMemberInput,
  options: CreateStaffMemberOptions = {},
): HospitalityStaffMember {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const roleReference = input.roleReference?.trim();
  const areaReference = input.areaReference?.trim();
  const parentStaffReference = input.parentStaffReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isStaffKind(input.staffKind)) {
    throw new Error(`Unknown staff kind: ${String(input.staffKind)}`);
  }

  const staffStatus: StaffStatus =
    input.staffStatus ?? STAFF_STATUSES.Draft;
  if (!isStaffStatus(staffStatus)) {
    throw new Error(`Unknown staff status: ${String(input.staffStatus)}`);
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error(
      "membershipReference must not be empty when provided",
    );
  }
  if (input.roleReference !== undefined && !roleReference) {
    throw new Error("roleReference must not be empty when provided");
  }
  if (input.areaReference !== undefined && !areaReference) {
    throw new Error("areaReference must not be empty when provided");
  }
  if (input.parentStaffReference !== undefined && !parentStaffReference) {
    throw new Error(
      "parentStaffReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error("staff does not apply to this hospitality business");
  }

  const providedReference = input.staffReference?.trim() ?? "";
  if (input.staffReference !== undefined && !providedReference) {
    throw new Error("staffReference must not be empty when provided");
  }

  const staffKind: StaffKind = input.staffKind;
  const staffReference = providedReference || allocateStaffReference();

  return {
    staffReference,
    staffKind,
    staffStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(roleReference !== undefined && roleReference.length > 0
      ? { roleReference }
      : {}),
    ...(areaReference !== undefined && areaReference.length > 0
      ? { areaReference }
      : {}),
    ...(parentStaffReference !== undefined &&
    parentStaffReference.length > 0
      ? { parentStaffReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateStaffReference(): string {
  staffSequence += 1;
  return `staff-${staffSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetStaffReferenceSequence(): void {
  staffSequence = 0;
}
