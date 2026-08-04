/**
 * Hospitality Table — physical operative position within a hospitality business.
 * First Smart Table OS capacity (existence only — no orders, reservations, or payments).
 *
 * @see DEC-HOSPITALITY-TABLE-CONTEXT-001
 */

/** Internal table kinds — floor positions, not order/reservation concepts. */
export const TABLE_KINDS = {
  /** Dining-room table. */
  Dining: "table.dining",
  /** Bar counter / bar seating. */
  Bar: "table.bar",
  /** Terrace / outdoor table. */
  Terrace: "table.terrace",
  /** Private dining table. */
  Private: "table.private",
  /** External / overflow table. */
  External: "table.external",
  /** Internal MotanOS / back-of-house table. */
  Internal: "table.internal",
} as const;

export type TableKind = (typeof TABLE_KINDS)[keyof typeof TABLE_KINDS];

export const TABLE_KIND_VALUES = Object.values(
  TABLE_KINDS,
) as readonly TableKind[];

/** Table floor status — occupancy state of a physical position. */
export const TABLE_STATUSES = {
  Available: "available",
  Reserved: "reserved",
  Occupied: "occupied",
  Cleaning: "cleaning",
  Blocked: "blocked",
  Inactive: "inactive",
} as const;

export type TableStatus =
  (typeof TABLE_STATUSES)[keyof typeof TABLE_STATUSES];

export const TABLE_STATUS_VALUES = Object.values(
  TABLE_STATUSES,
) as readonly TableStatus[];

/**
 * Opaque hospitality table — physical position existence only.
 * No order, reservation, customer, staff, or payment payloads.
 */
export type HospitalityTable = {
  /** Opaque unique table reference. */
  tableReference: string;
  /** Internal table kind. */
  tableKind: TableKind;
  /** Table status. */
  tableStatus: TableStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque floor-area pointer when known (Sala / Terraza / Barra / VIP). */
  areaReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque seating-capacity pointer when known. */
  capacityReference?: string;
  /** Opaque parent table pointer when nested (e.g. joined covers). */
  parentTableReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future table adapters.
 * Not wired in this foundation — no occupy / reserve / clean methods.
 */
export interface TablePort {
  createTable(input: CreateTableInput): Promise<HospitalityTable>;
  resolveTable(table: HospitalityTable): Promise<HospitalityTable>;
}

export type CreateTableInput = {
  tableKind: TableKind;
  tableStatus?: TableStatus;
  tableReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  areaReference?: string;
  locationReference?: string;
  capacityReference?: string;
  parentTableReference?: string;
  metadata?: Record<string, unknown>;
};

export function isTableKind(value: string): value is TableKind {
  return (TABLE_KIND_VALUES as readonly string[]).includes(value);
}

export function isTableStatus(value: string): value is TableStatus {
  return (TABLE_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityTable(
  value: unknown,
): value is HospitalityTable {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.tableReference === "string" &&
    candidate.tableReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "areaReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "capacityReference") &&
    optionalOpaqueOk(candidate, "parentTableReference") &&
    typeof candidate.tableKind === "string" &&
    isTableKind(candidate.tableKind) &&
    typeof candidate.tableStatus === "string" &&
    isTableStatus(candidate.tableStatus)
  );
}

export function isTablePort(value: unknown): value is TablePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as TablePort).createTable === "function" &&
    typeof (value as TablePort).resolveTable === "function"
  );
}
