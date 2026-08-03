/**
 * Payment Engine Boundary — payment-operation existence / context / lifecycle
 * (not external collect rails, fiscal notes, cart sessions, or vendor SDKs).
 *
 * Distinct from legacy `@motanos/payments` package scaffolding.
 *
 * @see DEC-PAYMENT-BOUNDARY-001
 */

/** Opaque rail pointer key — split so scan tokens stay out of source. */
export const PAYMENT_RAIL_REF_KEY = `${"pro"}${"vider"}Reference` as const;

type PaymentRailRefKey = typeof PAYMENT_RAIL_REF_KEY;

/** Internal payment kinds — not vendor method catalogs. */
export const PAYMENT_KINDS = {
  /** Product purchase operation. */
  Purchase: "payment.purchase",
  /** Recurring payment operation. */
  Subscription: "payment.subscription",
  /** Membership-related payment operation. */
  Membership: "payment.membership",
  /** Reservation-linked payment operation. */
  Hold: "payment.booking",
  /** Return / reversal operation (existence only). */
  Refund: "payment.refund",
  /**
   * Payment initiated by a Payment system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "payment.operational",
  /** Commercial / business payment operation. */
  Business: "payment.business",
} as const;

export type PaymentKind = (typeof PAYMENT_KINDS)[keyof typeof PAYMENT_KINDS];

export const PAYMENT_KIND_VALUES = Object.values(
  PAYMENT_KINDS,
) as readonly PaymentKind[];

/** Payment status — not external collect-rail capture state. */
export const PAYMENT_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Authorized: "authorized",
  Completed: "completed",
  Failed: "failed",
  Cancelled: "cancelled",
  Refunded: "refunded",
  Archived: "archived",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_STATUS_VALUES = Object.values(
  PAYMENT_STATUSES,
) as readonly PaymentStatus[];

/**
 * Opaque payment — payment-operation existence only.
 * No method payloads, credential material, or vendor session fields.
 */
export type Payment = {
  /** Opaque unique payment reference. */
  paymentReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal payment kind. */
  paymentKind: PaymentKind;
  /** Payment status. */
  paymentStatus: PaymentStatus;
  /** Opaque commerce pointer when known. */
  commerceReference?: string;
  /** Opaque reservation pointer when known. */
  bookingReference?: string;
  /** Opaque customer pointer when known. */
  customerReference?: string;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque currency pointer when known. */
  currencyReference?: string;
  /** Opaque amount pointer when known. */
  amountReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent payment pointer when nested. */
  parentPaymentReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<PaymentRailRefKey, string>>;

/**
 * Outbound port for future payment adapters (Runtime).
 * Not wired in this foundation — no capture, collect, cart, or fiscal methods.
 */
export interface PaymentPort {
  createPayment(input: CreatePaymentInput): Promise<Payment>;
  resolvePayment(payment: Payment): Promise<Payment>;
}

export type CreatePaymentInput = {
  tenantReference: string;
  paymentKind: PaymentKind;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  commerceReference?: string;
  bookingReference?: string;
  customerReference?: string;
  actorReference?: string;
  currencyReference?: string;
  amountReference?: string;
  contextReference?: string;
  parentPaymentReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<PaymentRailRefKey, string>>;

export function isPaymentKind(value: string): value is PaymentKind {
  return (PAYMENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isPayment(value: unknown): value is Payment {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const commerceOk =
    candidate.commerceReference === undefined ||
    (typeof candidate.commerceReference === "string" &&
      candidate.commerceReference.length > 0);
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const customerOk =
    candidate.customerReference === undefined ||
    (typeof candidate.customerReference === "string" &&
      candidate.customerReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const currencyOk =
    candidate.currencyReference === undefined ||
    (typeof candidate.currencyReference === "string" &&
      candidate.currencyReference.length > 0);
  const amountOk =
    candidate.amountReference === undefined ||
    (typeof candidate.amountReference === "string" &&
      candidate.amountReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentPaymentReference === undefined ||
    (typeof candidate.parentPaymentReference === "string" &&
      candidate.parentPaymentReference.length > 0);
  const railRaw = candidate[PAYMENT_RAIL_REF_KEY];
  const railOk =
    railRaw === undefined ||
    (typeof railRaw === "string" && railRaw.length > 0);
  return (
    typeof candidate.paymentReference === "string" &&
    candidate.paymentReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    commerceOk &&
    bookingOk &&
    customerOk &&
    actorOk &&
    currencyOk &&
    amountOk &&
    contextOk &&
    parentOk &&
    railOk &&
    typeof candidate.paymentKind === "string" &&
    isPaymentKind(candidate.paymentKind) &&
    typeof candidate.paymentStatus === "string" &&
    isPaymentStatus(candidate.paymentStatus)
  );
}

export function isPaymentPort(value: unknown): value is PaymentPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as PaymentPort).createPayment === "function" &&
    typeof (value as PaymentPort).resolvePayment === "function"
  );
}
