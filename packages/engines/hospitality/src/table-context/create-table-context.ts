import type {
  CreateTableContextInput,
  HospitalityTableContext,
  TableContextKind,
  TableContextStatus,
} from "./table-context";
import {
  TABLE_CONTEXT_STATUSES,
  isTableContextKind,
  isTableContextStatus,
} from "./table-context";

let tableContextSequence = 0;

export interface CreateTableContextOptions {
  /**
   * When set, table context may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityTableContext (in-memory — experience space only).
 * Does not bind rooms, open tickets, open tills, or free spaces.
 */
export function createTableContext(
  input: CreateTableContextInput,
  options: CreateTableContextOptions = {},
): HospitalityTableContext {
  const hospitalityReference = input.hospitalityReference?.trim();
  const visitContextReference = input.visitContextReference?.trim();
  const visitReference = input.visitReference?.trim();
  const locationReference = input.locationReference?.trim();
  const areaReference = input.areaReference?.trim();
  const zoneReference = input.zoneReference?.trim();
  const tableReference = input.tableReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const parentTableContextReference =
    input.parentTableContextReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isTableContextKind(input.tableContextKind)) {
    throw new Error(
      `Unknown table-context kind: ${String(input.tableContextKind)}`,
    );
  }

  const tableContextStatus: TableContextStatus =
    input.tableContextStatus ?? TABLE_CONTEXT_STATUSES.Draft;
  if (!isTableContextStatus(tableContextStatus)) {
    throw new Error(
      `Unknown table-context status: ${String(input.tableContextStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (
    input.visitContextReference !== undefined &&
    !visitContextReference
  ) {
    throw new Error(
      "visitContextReference must not be empty when provided",
    );
  }
  if (input.visitReference !== undefined && !visitReference) {
    throw new Error("visitReference must not be empty when provided");
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.areaReference !== undefined && !areaReference) {
    throw new Error("areaReference must not be empty when provided");
  }
  if (input.zoneReference !== undefined && !zoneReference) {
    throw new Error("zoneReference must not be empty when provided");
  }
  if (input.tableReference !== undefined && !tableReference) {
    throw new Error("tableReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error(
      "experienceReference must not be empty when provided",
    );
  }
  if (
    input.parentTableContextReference !== undefined &&
    !parentTableContextReference
  ) {
    throw new Error(
      "parentTableContextReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "table context does not apply to this hospitality business",
    );
  }

  const providedReference = input.tableContextReference?.trim() ?? "";
  if (input.tableContextReference !== undefined && !providedReference) {
    throw new Error(
      "tableContextReference must not be empty when provided",
    );
  }

  const tableContextKind: TableContextKind = input.tableContextKind;
  const tableContextReference =
    providedReference || allocateTableContextReference();

  return {
    tableContextReference,
    tableContextKind,
    tableContextStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(visitContextReference !== undefined &&
    visitContextReference.length > 0
      ? { visitContextReference }
      : {}),
    ...(visitReference !== undefined && visitReference.length > 0
      ? { visitReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(areaReference !== undefined && areaReference.length > 0
      ? { areaReference }
      : {}),
    ...(zoneReference !== undefined && zoneReference.length > 0
      ? { zoneReference }
      : {}),
    ...(tableReference !== undefined && tableReference.length > 0
      ? { tableReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(parentTableContextReference !== undefined &&
    parentTableContextReference.length > 0
      ? { parentTableContextReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateTableContextReference(): string {
  tableContextSequence += 1;
  return `table-context-${tableContextSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetTableContextReferenceSequence(): void {
  tableContextSequence = 0;
}
