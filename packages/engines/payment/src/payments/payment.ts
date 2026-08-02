/**
 * Payment Engine Boundary — payment intent / economic context / lifecycle state
 * (not charge rails, fiscal documents, method payloads, or vendor SDKs).
 *
 * Distinct from legacy `@motanos/payments` package scaffolding.
 *
 * @see DEC-PAYMENT-BOUNDARY-001
 * @see DEC-COMMERCE-BOUNDARY-001
 */

/** Internal payment kinds — not vendor method catalogs. */
export const PAYMENT_KINDS = {
  /** Product purchase intent. */
  Purchase: "payment.purchase",
  /** Experience / activity registration intent. */
  Registration: "payment.registration",
  /** Membership-related payment intent. */
  Membership: "payment.membership",
  /** Booking-related payment intent. */
  Booking: "payment.booking",
  /** Future return / reversal intent (context only). */
  Refund: "payment.refund",
  /**
   * Payment initiated by a Payment system operation.
   * Not a technical infrastructure error.
   */
  Operational: "payment.operational",
} as const;

export type PaymentKind = (typeof PAYMENT_KINDS)[keyof typeof PAYMENT_KINDS];

export const PAYMENT_KIND_VALUES = Object.values(
  PAYMENT_KINDS,
) as readonly PaymentKind[];

/** Payment intent status — not provider capture state. */
export const PAYMENT_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Authorized: "authorized",
  Completed: "completed",
  Failed: "failed",
  Cancelled: "cancelled",
  Refunded: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_STATUS_VALUES = Object.values(
  PAYMENT_STATUSES,
) as readonly PaymentStatus[];

/**
 * Opaque payment intent — economic context and lifecycle only.
 * No method payloads, credential material, or vendor session fields.
 */
export interface Payment {
  /** Opaque unique payment reference. */
  paymentReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal payment kind. */
  paymentKind: PaymentKind;
  /** Payment intent status. */
  paymentStatus: PaymentStatus;
  /** Opaque commerce offer pointer — not a live commerce graph. */
  commerceReference?: string;
  /** Opaque booking pointer — not a live reservation graph. */
  bookingReference?: string;
  /** Opaque membership pointer — not a live membership graph. */
  membershipReference?: string;
  /** Opaque experience pointer — not a live offering graph. */
  experienceReference?: string;
  /** Opaque amount pointer — not a live money calculation. */
  amountReference?: string;
  /** Opaque currency pointer — not a live FX engine. */
  currencyReference?: string;
  /** Opaque provider pointer — not a live vendor session. */
  providerReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future payment adapters (Runtime).
 * Not wired in this foundation — no capture, charge, or method processing.
 */
export interface PaymentPort {
  createPayment(input: CreatePaymentInput): Promise<Payment>;
  resolvePayment(payment: Payment): Promise<Payment>;
}

export interface CreatePaymentInput {
  tenantReference: string;
  paymentKind: PaymentKind;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  commerceReference?: string;
  bookingReference?: string;
  membershipReference?: string;
  experienceReference?: string;
  amountReference?: string;
  currencyReference?: string;
  providerReference?: string;
  metadata?: Record<string, unknown>;
}

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
  const membershipOk =
    candidate.membershipReference === undefined ||
    (typeof candidate.membershipReference === "string" &&
      candidate.membershipReference.length > 0);
  const experienceOk =
    candidate.experienceReference === undefined ||
    (typeof candidate.experienceReference === "string" &&
      candidate.experienceReference.length > 0);
  const amountOk =
    candidate.amountReference === undefined ||
    (typeof candidate.amountReference === "string" &&
      candidate.amountReference.length > 0);
  const currencyOk =
    candidate.currencyReference === undefined ||
    (typeof candidate.currencyReference === "string" &&
      candidate.currencyReference.length > 0);
  const providerOk =
    candidate.providerReference === undefined ||
    (typeof candidate.providerReference === "string" &&
      candidate.providerReference.length > 0);
  return (
    typeof candidate.paymentReference === "string" &&
    candidate.paymentReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    commerceOk &&
    bookingOk &&
    membershipOk &&
    experienceOk &&
    amountOk &&
    currencyOk &&
    providerOk &&
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
