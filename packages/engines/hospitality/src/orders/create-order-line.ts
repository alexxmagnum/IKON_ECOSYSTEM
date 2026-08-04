import type {
  CreateOrderLineInput,
  OrderLine,
  OrderLineStatus,
} from "./order-line";
import { ORDER_LINE_STATUSES, isOrderLineStatus } from "./order-line";

let lineSequence = 0;

/**
 * Build a checked OrderLine (in-memory — line existence only).
 * Does not prepare, serve, price totals, or open kitchen / TPV flows.
 */
export function createOrderLine(
  input: CreateOrderLineInput = {},
): OrderLine {
  const orderReference = input.orderReference?.trim();
  const itemReference = input.itemReference?.trim();
  const quantityReference = input.quantityReference?.trim();
  const priceReference = input.priceReference?.trim();
  const notesReference = input.notesReference?.trim();

  const lineStatus: OrderLineStatus =
    input.lineStatus ?? ORDER_LINE_STATUSES.Draft;
  if (!isOrderLineStatus(lineStatus)) {
    throw new Error(
      `Unknown order line status: ${String(input.lineStatus)}`,
    );
  }

  if (input.orderReference !== undefined && !orderReference) {
    throw new Error("orderReference must not be empty when provided");
  }
  if (input.itemReference !== undefined && !itemReference) {
    throw new Error("itemReference must not be empty when provided");
  }
  if (input.quantityReference !== undefined && !quantityReference) {
    throw new Error("quantityReference must not be empty when provided");
  }
  if (input.priceReference !== undefined && !priceReference) {
    throw new Error("priceReference must not be empty when provided");
  }
  if (input.notesReference !== undefined && !notesReference) {
    throw new Error("notesReference must not be empty when provided");
  }

  const providedReference = input.lineReference?.trim() ?? "";
  if (input.lineReference !== undefined && !providedReference) {
    throw new Error("lineReference must not be empty when provided");
  }

  const lineReference = providedReference || allocateLineReference();

  return {
    lineReference,
    lineStatus,
    ...(orderReference !== undefined && orderReference.length > 0
      ? { orderReference }
      : {}),
    ...(itemReference !== undefined && itemReference.length > 0
      ? { itemReference }
      : {}),
    ...(quantityReference !== undefined && quantityReference.length > 0
      ? { quantityReference }
      : {}),
    ...(priceReference !== undefined && priceReference.length > 0
      ? { priceReference }
      : {}),
    ...(notesReference !== undefined && notesReference.length > 0
      ? { notesReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateLineReference(): string {
  lineSequence += 1;
  return `order-line-${lineSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetOrderLineReferenceSequence(): void {
  lineSequence = 0;
}
