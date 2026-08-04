/**
 * Hospitality Order — operative order within a hospitality business.
 * Smart Table OS transactional nucleus (existence only): Table → Carta → Order.
 *
 * @see DEC-HOSPITALITY-ORDER-CONTEXT-001
 */

/** Internal order kinds — service modes, not kitchen/payment concepts. */
export const ORDER_KINDS = {
  /** Dining-room order. */
  Dining: "order.dining",
  /** Takeaway order. */
  Takeaway: "order.takeaway",
  /** Delivery order. */
  Delivery: "order.delivery",
  /** Bar order. */
  Bar: "order.bar",
  /** Internal MotanOS hospitality order. */
  Internal: "order.internal",
  /** Special / custom hospitality order. */
  Special: "order.special",
} as const;

export type OrderKind = (typeof ORDER_KINDS)[keyof typeof ORDER_KINDS];

export const ORDER_KIND_VALUES = Object.values(
  ORDER_KINDS,
) as readonly OrderKind[];

/** Order lifecycle status (existence labels only — no workflow execution). */
export const ORDER_STATUSES = {
  Draft: "draft",
  Confirmed: "confirmed",
  Preparing: "preparing",
  Ready: "ready",
  Served: "served",
  Cancelled: "cancelled",
  Paid: "paid",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const ORDER_STATUS_VALUES = Object.values(
  ORDER_STATUSES,
) as readonly OrderStatus[];

/**
 * Opaque hospitality order — order existence only.
 * No kitchen, print, payment, TPV, stock, or staff payloads.
 */
export type HospitalityOrder = {
  /** Opaque unique order reference. */
  orderReference: string;
  /** Internal order kind. */
  orderKind: OrderKind;
  /** Order status. */
  orderStatus: OrderStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque table pointer when known. */
  tableReference?: string;
  /** Opaque customer pointer when known (no Customer entity here). */
  customerReference?: string;
  /** Opaque session pointer when known. */
  sessionReference?: string;
  /** Opaque parent order pointer when nested. */
  parentOrderReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future order adapters.
 * Not wired in this foundation — no confirm / kitchen / charge methods.
 */
export interface OrderPort {
  createOrder(input: CreateOrderInput): Promise<HospitalityOrder>;
  resolveOrder(order: HospitalityOrder): Promise<HospitalityOrder>;
}

export type CreateOrderInput = {
  orderKind: OrderKind;
  orderStatus?: OrderStatus;
  orderReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  tableReference?: string;
  customerReference?: string;
  sessionReference?: string;
  parentOrderReference?: string;
  metadata?: Record<string, unknown>;
};

export function isOrderKind(value: string): value is OrderKind {
  return (ORDER_KIND_VALUES as readonly string[]).includes(value);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityOrder(
  value: unknown,
): value is HospitalityOrder {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.orderReference === "string" &&
    candidate.orderReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "tableReference") &&
    optionalOpaqueOk(candidate, "customerReference") &&
    optionalOpaqueOk(candidate, "sessionReference") &&
    optionalOpaqueOk(candidate, "parentOrderReference") &&
    typeof candidate.orderKind === "string" &&
    isOrderKind(candidate.orderKind) &&
    typeof candidate.orderStatus === "string" &&
    isOrderStatus(candidate.orderStatus)
  );
}

export function isOrderPort(value: unknown): value is OrderPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as OrderPort).createOrder === "function" &&
    typeof (value as OrderPort).resolveOrder === "function"
  );
}
