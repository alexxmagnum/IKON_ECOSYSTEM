import type {
  CostKind,
  CostStatus,
  CreateCostRecordInput,
  HospitalityCostRecord,
} from "./cost-record";
import {
  COST_STATUSES,
  isCostKind,
  isCostStatus,
} from "./cost-record";

let costSequence = 0;

export interface CreateCostRecordOptions {
  /**
   * When set, cost may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityCostRecord (in-memory — economic existence only).
 * Does not compute margin, food-cost ratios, or mutate stock.
 */
export function createCostRecord(
  input: CreateCostRecordInput,
  options: CreateCostRecordOptions = {},
): HospitalityCostRecord {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const menuItemReference = input.menuItemReference?.trim();
  const orderReference = input.orderReference?.trim();
  const orderLineReference = input.orderLineReference?.trim();
  const operationReference = input.operationReference?.trim();
  const valueReference = input.valueReference?.trim();
  const currencyReference = input.currencyReference?.trim();
  const parentCostReference = input.parentCostReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isCostKind(input.costKind)) {
    throw new Error(`Unknown cost kind: ${String(input.costKind)}`);
  }

  const costStatus: CostStatus =
    input.costStatus ?? COST_STATUSES.Draft;
  if (!isCostStatus(costStatus)) {
    throw new Error(`Unknown cost status: ${String(input.costStatus)}`);
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.menuItemReference !== undefined && !menuItemReference) {
    throw new Error("menuItemReference must not be empty when provided");
  }
  if (input.orderReference !== undefined && !orderReference) {
    throw new Error("orderReference must not be empty when provided");
  }
  if (input.orderLineReference !== undefined && !orderLineReference) {
    throw new Error(
      "orderLineReference must not be empty when provided",
    );
  }
  if (input.operationReference !== undefined && !operationReference) {
    throw new Error(
      "operationReference must not be empty when provided",
    );
  }
  if (input.valueReference !== undefined && !valueReference) {
    throw new Error("valueReference must not be empty when provided");
  }
  if (input.currencyReference !== undefined && !currencyReference) {
    throw new Error(
      "currencyReference must not be empty when provided",
    );
  }
  if (input.parentCostReference !== undefined && !parentCostReference) {
    throw new Error(
      "parentCostReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "cost does not apply to this hospitality business",
    );
  }

  const providedReference = input.costReference?.trim() ?? "";
  if (input.costReference !== undefined && !providedReference) {
    throw new Error("costReference must not be empty when provided");
  }

  const costKind: CostKind = input.costKind;
  const costReference = providedReference || allocateCostReference();

  return {
    costReference,
    costKind,
    costStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(menuItemReference !== undefined && menuItemReference.length > 0
      ? { menuItemReference }
      : {}),
    ...(orderReference !== undefined && orderReference.length > 0
      ? { orderReference }
      : {}),
    ...(orderLineReference !== undefined && orderLineReference.length > 0
      ? { orderLineReference }
      : {}),
    ...(operationReference !== undefined && operationReference.length > 0
      ? { operationReference }
      : {}),
    ...(valueReference !== undefined && valueReference.length > 0
      ? { valueReference }
      : {}),
    ...(currencyReference !== undefined && currencyReference.length > 0
      ? { currencyReference }
      : {}),
    ...(parentCostReference !== undefined && parentCostReference.length > 0
      ? { parentCostReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCostReference(): string {
  costSequence += 1;
  return `cost-${costSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetCostReferenceSequence(): void {
  costSequence = 0;
}
