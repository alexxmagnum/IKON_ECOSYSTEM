import type {
  CreateHospitalityInput,
  HospitalityBusiness,
  HospitalityKind,
  HospitalityStatus,
} from "./hospitality";
import {
  HOSPITALITY_STATUSES,
  isHospitalityKind,
  isHospitalityStatus,
} from "./hospitality";

let hospitalitySequence = 0;

export interface CreateHospitalityOptions {
  /**
   * When set, hospitality may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked HospitalityBusiness (in-memory — vertical existence only).
 * Does not create tables, menus, orders, staff, or kitchen flows.
 */
export function createHospitality(
  input: CreateHospitalityInput,
  options: CreateHospitalityOptions = {},
): HospitalityBusiness {
  const tenantReference = input.tenantReference?.trim();
  const contextReference = input.contextReference?.trim();
  const organizationReference = input.organizationReference?.trim();
  const locationReference = input.locationReference?.trim();
  const brandReference = input.brandReference?.trim();
  const parentHospitalityReference =
    input.parentHospitalityReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isHospitalityKind(input.hospitalityKind)) {
    throw new Error(
      `Unknown hospitality kind: ${String(input.hospitalityKind)}`,
    );
  }

  const hospitalityStatus: HospitalityStatus =
    input.hospitalityStatus ?? HOSPITALITY_STATUSES.Draft;
  if (!isHospitalityStatus(hospitalityStatus)) {
    throw new Error(
      `Unknown hospitality status: ${String(input.hospitalityStatus)}`,
    );
  }

  if (input.tenantReference !== undefined && !tenantReference) {
    throw new Error("tenantReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error(
      "organizationReference must not be empty when provided",
    );
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.brandReference !== undefined && !brandReference) {
    throw new Error("brandReference must not be empty when provided");
  }
  if (
    input.parentHospitalityReference !== undefined &&
    !parentHospitalityReference
  ) {
    throw new Error(
      "parentHospitalityReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("hospitality does not apply to this scope");
  }

  const providedReference = input.hospitalityReference?.trim() ?? "";
  if (input.hospitalityReference !== undefined && !providedReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }

  const hospitalityKind: HospitalityKind = input.hospitalityKind;
  const hospitalityReference =
    providedReference || allocateHospitalityReference();

  return {
    hospitalityReference,
    hospitalityKind,
    hospitalityStatus,
    ...(tenantReference !== undefined && tenantReference.length > 0
      ? { tenantReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(organizationReference !== undefined &&
    organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(brandReference !== undefined && brandReference.length > 0
      ? { brandReference }
      : {}),
    ...(parentHospitalityReference !== undefined &&
    parentHospitalityReference.length > 0
      ? { parentHospitalityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateHospitalityReference(): string {
  hospitalitySequence += 1;
  return `hospitality-${hospitalitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetHospitalityReferenceSequence(): void {
  hospitalitySequence = 0;
}
