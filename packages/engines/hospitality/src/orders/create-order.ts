import type {
  CreateOrderInput,
  HospitalityOrder,
  OrderKind,
  OrderStatus,
} from "./order";
import { ORDER_STATUSES, isOrderKind, isOrderStatus } from "./order";

let orderSequence = 0;

export interface CreateOrderOptions {
  /**
   * When set, order may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityOrder (in-memory — order existence only).
 * Does not confirm, print, charge, or open kitchen / TPV flows.
 */
export function createOrder(
  input: CreateOrderInput,
  options: CreateOrderOptions = {},
): HospitalityOrder {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const tableReference = input.tableReference?.trim();
  const customerReference = input.customerReference?.trim();
  const sessionReference = input.sessionReference?.trim();
  const parentOrderReference = input.parentOrderReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isOrderKind(input.orderKind)) {
    throw new Error(`Unknown order kind: ${String(input.orderKind)}`);
  }

  const orderStatus: OrderStatus =
    input.orderStatus ?? ORDER_STATUSES.Draft;
  if (!isOrderStatus(orderStatus)) {
    throw new Error(`Unknown order status: ${String(input.orderStatus)}`);
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.tableReference !== undefined && !tableReference) {
    throw new Error("tableReference must not be empty when provided");
  }
  if (input.customerReference !== undefined && !customerReference) {
    throw new Error("customerReference must not be empty when provided");
  }
  if (input.sessionReference !== undefined && !sessionReference) {
    throw new Error("sessionReference must not be empty when provided");
  }
  if (input.parentOrderReference !== undefined && !parentOrderReference) {
    throw new Error(
      "parentOrderReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error("order does not apply to this hospitality business");
  }

  const providedReference = input.orderReference?.trim() ?? "";
  if (input.orderReference !== undefined && !providedReference) {
    throw new Error("orderReference must not be empty when provided");
  }

  const orderKind: OrderKind = input.orderKind;
  const orderReference = providedReference || allocateOrderReference();

  return {
    orderReference,
    orderKind,
    orderStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(tableReference !== undefined && tableReference.length > 0
      ? { tableReference }
      : {}),
    ...(customerReference !== undefined && customerReference.length > 0
      ? { customerReference }
      : {}),
    ...(sessionReference !== undefined && sessionReference.length > 0
      ? { sessionReference }
      : {}),
    ...(parentOrderReference !== undefined &&
    parentOrderReference.length > 0
      ? { parentOrderReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateOrderReference(): string {
  orderSequence += 1;
  return `order-${orderSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetOrderReferenceSequence(): void {
  orderSequence = 0;
}
