/**
 * Hospitality Table Context — table space within an on-site experience.
 * Bridge only: Visit Context → Table Context → future ticket / till ops.
 *
 * Distinct from HospitalityTable (physical floor position under src/tables).
 *
 * @see DEC-HOSPITALITY-TABLE-CONTEXT-EXPERIENCE-001
 */

/** Internal table-context kinds — experience space, not furniture catalogs. */
export const TABLE_CONTEXT_KINDS = {
  /** Space tied to a concrete table. */
  Table: "table-context.table",
  /** Grouping space. */
  Area: "table-context.area",
  /** Specific zone. */
  Zone: "table-context.zone",
  /** Space created for a concrete experience. */
  Experience: "table-context.experience",
  /** Internal MotanOS hospitality table context. */
  Internal: "table-context.internal",
} as const;

export type TableContextKind =
  (typeof TABLE_CONTEXT_KINDS)[keyof typeof TABLE_CONTEXT_KINDS];

export const TABLE_CONTEXT_KIND_VALUES = Object.values(
  TABLE_CONTEXT_KINDS,
) as readonly TableContextKind[];

/** Table-context lifecycle status (existence labels only — no ticket/till ops). */
export const TABLE_CONTEXT_STATUSES = {
  Draft: "draft",
  Available: "available",
  Active: "active",
  Occupied: "occupied",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type TableContextStatus =
  (typeof TABLE_CONTEXT_STATUSES)[keyof typeof TABLE_CONTEXT_STATUSES];

export const TABLE_CONTEXT_STATUS_VALUES = Object.values(
  TABLE_CONTEXT_STATUSES,
) as readonly TableContextStatus[];

/**
 * Opaque hospitality table context — experience-space existence only.
 * Opaque tableReference may point at a future physical resource — not ops.
 * No seat counts, occupancy flags, map coords, or ticket pointers.
 * No till, prep rails, hold rails, tariff, alert, or score payloads.
 */
export type HospitalityTableContext = {
  /** Opaque unique table-context reference. */
  tableContextReference: string;
  /** Internal table-context kind. */
  tableContextKind: TableContextKind;
  /** Table-context status. */
  tableContextStatus: TableContextStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque visit-context pointer when known. */
  visitContextReference?: string;
  /** Opaque visit-experience pointer when known. */
  visitReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque area pointer when known. */
  areaReference?: string;
  /** Opaque zone pointer when known. */
  zoneReference?: string;
  /** Opaque future physical table pointer when known. */
  tableReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque parent table-context pointer when nested. */
  parentTableContextReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future table-context adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface TableContextPort {
  createTableContext(
    input: CreateTableContextInput,
  ): Promise<HospitalityTableContext>;
  resolveTableContext(
    tableContext: HospitalityTableContext,
  ): Promise<HospitalityTableContext>;
}

export type CreateTableContextInput = {
  tableContextKind: TableContextKind;
  tableContextStatus?: TableContextStatus;
  tableContextReference?: string;
  hospitalityReference?: string;
  visitContextReference?: string;
  visitReference?: string;
  locationReference?: string;
  areaReference?: string;
  zoneReference?: string;
  tableReference?: string;
  experienceReference?: string;
  parentTableContextReference?: string;
  metadata?: Record<string, unknown>;
};

export function isTableContextKind(value: string): value is TableContextKind {
  return (TABLE_CONTEXT_KIND_VALUES as readonly string[]).includes(value);
}

export function isTableContextStatus(
  value: string,
): value is TableContextStatus {
  return (TABLE_CONTEXT_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityTableContext(
  value: unknown,
): value is HospitalityTableContext {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.tableContextReference === "string" &&
    candidate.tableContextReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "visitContextReference") &&
    optionalOpaqueOk(candidate, "visitReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "areaReference") &&
    optionalOpaqueOk(candidate, "zoneReference") &&
    optionalOpaqueOk(candidate, "tableReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "parentTableContextReference") &&
    typeof candidate.tableContextKind === "string" &&
    isTableContextKind(candidate.tableContextKind) &&
    typeof candidate.tableContextStatus === "string" &&
    isTableContextStatus(candidate.tableContextStatus)
  );
}

export function isTableContextPort(value: unknown): value is TableContextPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as TableContextPort).createTableContext === "function" &&
    typeof (value as TableContextPort).resolveTableContext === "function"
  );
}
