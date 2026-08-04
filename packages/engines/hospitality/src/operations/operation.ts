/**
 * Hospitality Operation — preparation or service activity within a hospitality business.
 * Smart Table OS layer between Order → Preparation → Service (existence only).
 *
 * @see DEC-HOSPITALITY-SERVICE-OPERATIONS-CONTEXT-001
 */

/** Internal operation kinds — service areas, not stock or bill-of-materials concepts. */
export const OPERATION_KINDS = {
  /** Kitchen preparation operation. */
  Kitchen: "operation.kitchen",
  /** Bar preparation operation. */
  Bar: "operation.bar",
  /** Dining-room service operation. */
  Service: "operation.service",
  /** Takeaway handover operation. */
  Takeaway: "operation.takeaway",
  /** Delivery handover operation. */
  Delivery: "operation.delivery",
  /** Internal MotanOS hospitality operation. */
  Internal: "operation.internal",
} as const;

export type OperationKind =
  (typeof OPERATION_KINDS)[keyof typeof OPERATION_KINDS];

export const OPERATION_KIND_VALUES = Object.values(
  OPERATION_KINDS,
) as readonly OperationKind[];

/** Operation lifecycle status (existence labels only — no workflow execution). */
export const OPERATION_STATUSES = {
  Draft: "draft",
  Queued: "queued",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type OperationStatus =
  (typeof OPERATION_STATUSES)[keyof typeof OPERATION_STATUSES];

export const OPERATION_STATUS_VALUES = Object.values(
  OPERATION_STATUSES,
) as readonly OperationStatus[];

/**
 * Opaque hospitality operation — preparation/service activity existence only.
 * No stock, bill-of-materials, tariff, ticket-out, till, roster, or wage payloads.
 */
export type HospitalityOperation = {
  /** Opaque unique operation reference. */
  operationReference: string;
  /** Internal operation kind. */
  operationKind: OperationKind;
  /** Operation status. */
  operationStatus: OperationStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque order pointer when known. */
  orderReference?: string;
  /** Opaque order-line pointer when known. */
  orderLineReference?: string;
  /** Opaque staff pointer when known. */
  staffReference?: string;
  /** Opaque service-area pointer when known. */
  areaReference?: string;
  /** Opaque parent operation pointer when nested. */
  parentOperationReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future operation adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface OperationPort {
  createOperation(
    input: CreateOperationInput,
  ): Promise<HospitalityOperation>;
  resolveOperation(
    operation: HospitalityOperation,
  ): Promise<HospitalityOperation>;
}

export type CreateOperationInput = {
  operationKind: OperationKind;
  operationStatus?: OperationStatus;
  operationReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  orderReference?: string;
  orderLineReference?: string;
  staffReference?: string;
  areaReference?: string;
  parentOperationReference?: string;
  metadata?: Record<string, unknown>;
};

export function isOperationKind(value: string): value is OperationKind {
  return (OPERATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isOperationStatus(value: string): value is OperationStatus {
  return (OPERATION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityOperation(
  value: unknown,
): value is HospitalityOperation {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.operationReference === "string" &&
    candidate.operationReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "orderReference") &&
    optionalOpaqueOk(candidate, "orderLineReference") &&
    optionalOpaqueOk(candidate, "staffReference") &&
    optionalOpaqueOk(candidate, "areaReference") &&
    optionalOpaqueOk(candidate, "parentOperationReference") &&
    typeof candidate.operationKind === "string" &&
    isOperationKind(candidate.operationKind) &&
    typeof candidate.operationStatus === "string" &&
    isOperationStatus(candidate.operationStatus)
  );
}

export function isOperationPort(value: unknown): value is OperationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as OperationPort).createOperation === "function" &&
    typeof (value as OperationPort).resolveOperation === "function"
  );
}
