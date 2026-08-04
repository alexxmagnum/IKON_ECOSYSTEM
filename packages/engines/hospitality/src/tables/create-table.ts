import type {
  CreateTableInput,
  HospitalityTable,
  TableKind,
  TableStatus,
} from "./table";
import { TABLE_STATUSES, isTableKind, isTableStatus } from "./table";

let tableSequence = 0;

export interface CreateTableOptions {
  /**
   * When set, table may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityTable (in-memory — physical position existence only).
 * Does not occupy, reserve, clean, or bind customers / orders / staff.
 */
export function createTable(
  input: CreateTableInput,
  options: CreateTableOptions = {},
): HospitalityTable {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const areaReference = input.areaReference?.trim();
  const locationReference = input.locationReference?.trim();
  const capacityReference = input.capacityReference?.trim();
  const parentTableReference = input.parentTableReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isTableKind(input.tableKind)) {
    throw new Error(`Unknown table kind: ${String(input.tableKind)}`);
  }

  const tableStatus: TableStatus =
    input.tableStatus ?? TABLE_STATUSES.Available;
  if (!isTableStatus(tableStatus)) {
    throw new Error(`Unknown table status: ${String(input.tableStatus)}`);
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.areaReference !== undefined && !areaReference) {
    throw new Error("areaReference must not be empty when provided");
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.capacityReference !== undefined && !capacityReference) {
    throw new Error("capacityReference must not be empty when provided");
  }
  if (input.parentTableReference !== undefined && !parentTableReference) {
    throw new Error(
      "parentTableReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error("table does not apply to this hospitality business");
  }

  const providedReference = input.tableReference?.trim() ?? "";
  if (input.tableReference !== undefined && !providedReference) {
    throw new Error("tableReference must not be empty when provided");
  }

  const tableKind: TableKind = input.tableKind;
  const tableReference = providedReference || allocateTableReference();

  return {
    tableReference,
    tableKind,
    tableStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(areaReference !== undefined && areaReference.length > 0
      ? { areaReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(capacityReference !== undefined && capacityReference.length > 0
      ? { capacityReference }
      : {}),
    ...(parentTableReference !== undefined &&
    parentTableReference.length > 0
      ? { parentTableReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateTableReference(): string {
  tableSequence += 1;
  return `table-${tableSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetTableReferenceSequence(): void {
  tableSequence = 0;
}
