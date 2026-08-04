/**
 * Hospitality Cost Record — operative economic value within a hospitality business.
 * Existence layer for Product → Sale → Cost → Margin (no computation yet).
 *
 * @see DEC-HOSPITALITY-COST-CONTROL-CONTEXT-001
 */

/** Internal cost kinds — operative economics, not stock/commerce engines. */
export const COST_KINDS = {
  /** Cost tied to a product or item. */
  Product: "cost.product",
  /** Cost tied to a service operation. */
  Operation: "cost.operation",
  /** Cost tied to an order. */
  Order: "cost.order",
  /** Cost tied to a menu structure. */
  Menu: "cost.menu",
  /** Internal MotanOS hospitality cost. */
  Internal: "cost.internal",
  /** Provisional / estimated cost. */
  Estimated: "cost.estimated",
} as const;

export type CostKind = (typeof COST_KINDS)[keyof typeof COST_KINDS];

export const COST_KIND_VALUES = Object.values(
  COST_KINDS,
) as readonly CostKind[];

/** Cost record lifecycle status (existence labels only — no margin engine). */
export const COST_STATUSES = {
  Draft: "draft",
  Active: "active",
  Calculated: "calculated",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CostStatus = (typeof COST_STATUSES)[keyof typeof COST_STATUSES];

export const COST_STATUS_VALUES = Object.values(
  COST_STATUSES,
) as readonly CostStatus[];

/**
 * Opaque hospitality cost record — operative economic existence only.
 * Monetary magnitudes live behind opaque value/currency refs (no bare numeric field).
 * No stock, vendor, buy-order, bill-of-materials, ledger, till, or tax payloads.
 */
export type HospitalityCostRecord = {
  /** Opaque unique cost reference. */
  costReference: string;
  /** Internal cost kind. */
  costKind: CostKind;
  /** Cost status. */
  costStatus: CostStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque menu-item pointer when known. */
  menuItemReference?: string;
  /** Opaque order pointer when known. */
  orderReference?: string;
  /** Opaque order-line pointer when known. */
  orderLineReference?: string;
  /** Opaque operation pointer when known. */
  operationReference?: string;
  /** Opaque monetary-value pointer when known. */
  valueReference?: string;
  /** Opaque currency pointer when known. */
  currencyReference?: string;
  /** Opaque parent cost pointer when nested. */
  parentCostReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future cost-control adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface CostControlPort {
  createCostRecord(
    input: CreateCostRecordInput,
  ): Promise<HospitalityCostRecord>;
  resolveCostRecord(
    cost: HospitalityCostRecord,
  ): Promise<HospitalityCostRecord>;
}

export type CreateCostRecordInput = {
  costKind: CostKind;
  costStatus?: CostStatus;
  costReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  menuItemReference?: string;
  orderReference?: string;
  orderLineReference?: string;
  operationReference?: string;
  valueReference?: string;
  currencyReference?: string;
  parentCostReference?: string;
  metadata?: Record<string, unknown>;
};

export function isCostKind(value: string): value is CostKind {
  return (COST_KIND_VALUES as readonly string[]).includes(value);
}

export function isCostStatus(value: string): value is CostStatus {
  return (COST_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityCostRecord(
  value: unknown,
): value is HospitalityCostRecord {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.costReference === "string" &&
    candidate.costReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "menuItemReference") &&
    optionalOpaqueOk(candidate, "orderReference") &&
    optionalOpaqueOk(candidate, "orderLineReference") &&
    optionalOpaqueOk(candidate, "operationReference") &&
    optionalOpaqueOk(candidate, "valueReference") &&
    optionalOpaqueOk(candidate, "currencyReference") &&
    optionalOpaqueOk(candidate, "parentCostReference") &&
    typeof candidate.costKind === "string" &&
    isCostKind(candidate.costKind) &&
    typeof candidate.costStatus === "string" &&
    isCostStatus(candidate.costStatus)
  );
}

export function isCostControlPort(value: unknown): value is CostControlPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CostControlPort).createCostRecord === "function" &&
    typeof (value as CostControlPort).resolveCostRecord === "function"
  );
}
