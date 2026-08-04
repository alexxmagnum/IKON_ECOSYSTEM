import type {
  CreateOperationInput,
  HospitalityOperation,
  OperationKind,
  OperationStatus,
} from "./operation";
import {
  OPERATION_STATUSES,
  isOperationKind,
  isOperationStatus,
} from "./operation";

let operationSequence = 0;

export interface CreateOperationOptions {
  /**
   * When set, operation may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityOperation (in-memory — activity existence only).
 * Does not start prep, emit tickets, mutate stock, or open till flows.
 */
export function createOperation(
  input: CreateOperationInput,
  options: CreateOperationOptions = {},
): HospitalityOperation {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const orderReference = input.orderReference?.trim();
  const orderLineReference = input.orderLineReference?.trim();
  const staffReference = input.staffReference?.trim();
  const areaReference = input.areaReference?.trim();
  const parentOperationReference = input.parentOperationReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isOperationKind(input.operationKind)) {
    throw new Error(
      `Unknown operation kind: ${String(input.operationKind)}`,
    );
  }

  const operationStatus: OperationStatus =
    input.operationStatus ?? OPERATION_STATUSES.Draft;
  if (!isOperationStatus(operationStatus)) {
    throw new Error(
      `Unknown operation status: ${String(input.operationStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.orderReference !== undefined && !orderReference) {
    throw new Error("orderReference must not be empty when provided");
  }
  if (input.orderLineReference !== undefined && !orderLineReference) {
    throw new Error(
      "orderLineReference must not be empty when provided",
    );
  }
  if (input.staffReference !== undefined && !staffReference) {
    throw new Error("staffReference must not be empty when provided");
  }
  if (input.areaReference !== undefined && !areaReference) {
    throw new Error("areaReference must not be empty when provided");
  }
  if (
    input.parentOperationReference !== undefined &&
    !parentOperationReference
  ) {
    throw new Error(
      "parentOperationReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "operation does not apply to this hospitality business",
    );
  }

  const providedReference = input.operationReference?.trim() ?? "";
  if (input.operationReference !== undefined && !providedReference) {
    throw new Error(
      "operationReference must not be empty when provided",
    );
  }

  const operationKind: OperationKind = input.operationKind;
  const operationReference =
    providedReference || allocateOperationReference();

  return {
    operationReference,
    operationKind,
    operationStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(orderReference !== undefined && orderReference.length > 0
      ? { orderReference }
      : {}),
    ...(orderLineReference !== undefined && orderLineReference.length > 0
      ? { orderLineReference }
      : {}),
    ...(staffReference !== undefined && staffReference.length > 0
      ? { staffReference }
      : {}),
    ...(areaReference !== undefined && areaReference.length > 0
      ? { areaReference }
      : {}),
    ...(parentOperationReference !== undefined &&
    parentOperationReference.length > 0
      ? { parentOperationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateOperationReference(): string {
  operationSequence += 1;
  return `operation-${operationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetOperationReferenceSequence(): void {
  operationSequence = 0;
}
