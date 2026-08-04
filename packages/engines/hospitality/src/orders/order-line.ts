/**
 * OrderLine — consumption line within a hospitality order.
 *
 * @see DEC-HOSPITALITY-ORDER-CONTEXT-001
 */

/** Line lifecycle status (existence labels only). */
export const ORDER_LINE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Prepared: "prepared",
  Served: "served",
  Cancelled: "cancelled",
} as const;

export type OrderLineStatus =
  (typeof ORDER_LINE_STATUSES)[keyof typeof ORDER_LINE_STATUSES];

export const ORDER_LINE_STATUS_VALUES = Object.values(
  ORDER_LINE_STATUSES,
) as readonly OrderLineStatus[];

/**
 * Opaque order line — line existence only.
 * itemReference / priceReference / quantityReference are opaque.
 * No pricing totals, kitchen tickets, or inventory deductions.
 */
export type OrderLine = {
  /** Opaque unique line reference. */
  lineReference: string;
  /** Line status. */
  lineStatus: OrderLineStatus;
  /** Opaque order pointer when known. */
  orderReference?: string;
  /** Opaque menu-item pointer when known. */
  itemReference?: string;
  /** Opaque quantity pointer when known. */
  quantityReference?: string;
  /** Opaque price pointer when known (future Pricing Engine). */
  priceReference?: string;
  /** Opaque notes pointer when known. */
  notesReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future order-line adapters.
 * Not wired in this foundation — no kitchen / charge methods.
 */
export interface OrderLinePort {
  createOrderLine(input: CreateOrderLineInput): Promise<OrderLine>;
  resolveOrderLine(line: OrderLine): Promise<OrderLine>;
}

export type CreateOrderLineInput = {
  lineStatus?: OrderLineStatus;
  lineReference?: string;
  orderReference?: string;
  itemReference?: string;
  quantityReference?: string;
  priceReference?: string;
  notesReference?: string;
  metadata?: Record<string, unknown>;
};

export function isOrderLineStatus(value: string): value is OrderLineStatus {
  return (ORDER_LINE_STATUS_VALUES as readonly string[]).includes(value);
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

export function isOrderLine(value: unknown): value is OrderLine {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.lineReference === "string" &&
    candidate.lineReference.length > 0 &&
    optionalOpaqueOk(candidate, "orderReference") &&
    optionalOpaqueOk(candidate, "itemReference") &&
    optionalOpaqueOk(candidate, "quantityReference") &&
    optionalOpaqueOk(candidate, "priceReference") &&
    optionalOpaqueOk(candidate, "notesReference") &&
    typeof candidate.lineStatus === "string" &&
    isOrderLineStatus(candidate.lineStatus)
  );
}

export function isOrderLinePort(value: unknown): value is OrderLinePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as OrderLinePort).createOrderLine === "function" &&
    typeof (value as OrderLinePort).resolveOrderLine === "function"
  );
}
