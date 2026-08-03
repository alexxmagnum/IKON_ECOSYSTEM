/**
 * Booking Balance Boundary — pending economic state for a booking (not Payment / ledger).
 * Distinct from Pricing, Discount, Fee, Tax, and Payment capture.
 *
 * @see DEC-BOOKING-BALANCE-001
 * @see DEC-BOOKING-PAYMENT-001
 */

/** Internal balance kinds — not wallet/ledger account types. */
export const BOOKING_BALANCE_KINDS = {
  RemainingBalance: "booking.remaining_balance",
  DepositBalance: "booking.deposit_balance",
  RefundBalance: "booking.refund_balance",
  OutstandingBalance: "booking.outstanding_balance",
} as const;

export type BookingBalanceKind =
  (typeof BOOKING_BALANCE_KINDS)[keyof typeof BOOKING_BALANCE_KINDS];

export const BOOKING_BALANCE_KIND_VALUES = Object.values(
  BOOKING_BALANCE_KINDS,
) as readonly BookingBalanceKind[];

/** Balance settlement status — not a Payment gateway status. */
export const BOOKING_BALANCE_STATUSES = {
  Pending: "pending",
  Partial: "partial",
  Settled: "settled",
  Cancelled: "cancelled",
} as const;

export type BookingBalanceStatus =
  (typeof BOOKING_BALANCE_STATUSES)[keyof typeof BOOKING_BALANCE_STATUSES];

export const BOOKING_BALANCE_STATUS_VALUES = Object.values(
  BOOKING_BALANCE_STATUSES,
) as readonly BookingBalanceStatus[];

/**
 * Opaque context for a balance evaluation.
 * No bank accounts, cards, invoices, PII, or credentials.
 */
export interface BookingBalanceRequest {
  /** Opaque unique balance evaluation reference. */
  balanceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Optional booking related to the evaluation. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque amount reference from economic pipeline — not a charge id. */
  amountReference: string;
  /** Internal balance kind. */
  balanceKind: BookingBalanceKind;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a Booking balance evaluation.
 * Represents pending economic state — not a ledger entry or Payment movement.
 */
export interface BalanceDecision {
  balanceReference: string;
  amountReference: string;
  balanceStatus: BookingBalanceStatus;
  reason?: string;
}

/**
 * Booking Balance — answers “what is the pending economic state of this booking?”
 */
export interface BookingBalance {
  evaluate(request: BookingBalanceRequest): Promise<BalanceDecision>;
}

/**
 * Outbound port for future balance providers (Runtime adapters).
 * Not wired in this foundation — no accounting SDK.
 */
export interface BookingBalancePort {
  evaluateBalance(request: BookingBalanceRequest): Promise<BalanceDecision>;
}

export interface CreateBookingBalanceRequestInput {
  tenantReference: string;
  amountReference: string;
  balanceKind: BookingBalanceKind;
  balanceReference?: string;
  bookingReference?: string;
  actorReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingBalanceKind(
  value: string,
): value is BookingBalanceKind {
  return (BOOKING_BALANCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingBalanceStatus(
  value: string,
): value is BookingBalanceStatus {
  return (BOOKING_BALANCE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBookingBalanceRequest(
  value: unknown,
): value is BookingBalanceRequest {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  return (
    typeof candidate.balanceReference === "string" &&
    candidate.balanceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    typeof candidate.amountReference === "string" &&
    candidate.amountReference.length > 0 &&
    typeof candidate.balanceKind === "string" &&
    isBookingBalanceKind(candidate.balanceKind)
  );
}

export function isBalanceDecision(value: unknown): value is BalanceDecision {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.balanceReference === "string" &&
    typeof candidate.amountReference === "string" &&
    typeof candidate.balanceStatus === "string" &&
    isBookingBalanceStatus(candidate.balanceStatus)
  );
}

export function isBookingBalance(value: unknown): value is BookingBalance {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingBalance).evaluate === "function"
  );
}

export function isBookingBalancePort(
  value: unknown,
): value is BookingBalancePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingBalancePort).evaluateBalance === "function"
  );
}
