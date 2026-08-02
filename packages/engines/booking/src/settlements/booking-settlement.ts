/**
 * Booking Settlement Boundary — final liquidation state for a booking
 * (not Payment capture / Balance pending / ledger).
 *
 * @see DEC-BOOKING-SETTLEMENT-001
 * @see DEC-BOOKING-PAYMENT-001
 * @see DEC-BOOKING-BALANCE-001
 */

/** Internal settlement kinds — not accounting journal types. */
export const BOOKING_SETTLEMENT_KINDS = {
  FullSettlement: "booking.full_settlement",
  PartialSettlement: "booking.partial_settlement",
  DepositSettlement: "booking.deposit_settlement",
  RefundSettlement: "booking.refund_settlement",
} as const;

export type BookingSettlementKind =
  (typeof BOOKING_SETTLEMENT_KINDS)[keyof typeof BOOKING_SETTLEMENT_KINDS];

export const BOOKING_SETTLEMENT_KIND_VALUES = Object.values(
  BOOKING_SETTLEMENT_KINDS,
) as readonly BookingSettlementKind[];

/** Settlement liquidation status — not a Payment gateway status. */
export const BOOKING_SETTLEMENT_STATUSES = {
  Pending: "pending",
  Processing: "processing",
  Settled: "settled",
  Failed: "failed",
  Cancelled: "cancelled",
} as const;

export type BookingSettlementStatus =
  (typeof BOOKING_SETTLEMENT_STATUSES)[keyof typeof BOOKING_SETTLEMENT_STATUSES];

export const BOOKING_SETTLEMENT_STATUS_VALUES = Object.values(
  BOOKING_SETTLEMENT_STATUSES,
) as readonly BookingSettlementStatus[];

/**
 * Opaque context for a settlement evaluation.
 * No bank accounts, cards, invoices, PII, or credentials.
 */
export interface BookingSettlementRequest {
  /** Opaque unique settlement evaluation reference. */
  settlementReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Optional booking related to the evaluation. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque amount reference from economic pipeline — not a charge id. */
  amountReference: string;
  /** Internal settlement kind. */
  settlementKind: BookingSettlementKind;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a Booking settlement evaluation.
 * Represents final liquidation state — not a ledger entry or Payment movement.
 */
export interface SettlementDecision {
  settlementReference: string;
  amountReference: string;
  settlementStatus: BookingSettlementStatus;
  reason?: string;
}

/**
 * Booking Settlement — answers “what is the final economic liquidation state?”
 */
export interface BookingSettlement {
  evaluate(request: BookingSettlementRequest): Promise<SettlementDecision>;
}

/**
 * Outbound port for future settlement providers (Runtime adapters).
 * Not wired in this foundation — no accounting SDK.
 */
export interface BookingSettlementPort {
  evaluateSettlement(
    request: BookingSettlementRequest,
  ): Promise<SettlementDecision>;
}

export interface CreateBookingSettlementRequestInput {
  tenantReference: string;
  amountReference: string;
  settlementKind: BookingSettlementKind;
  settlementReference?: string;
  bookingReference?: string;
  actorReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingSettlementKind(
  value: string,
): value is BookingSettlementKind {
  return (BOOKING_SETTLEMENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingSettlementStatus(
  value: string,
): value is BookingSettlementStatus {
  return (BOOKING_SETTLEMENT_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingSettlementRequest(
  value: unknown,
): value is BookingSettlementRequest {
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
    typeof candidate.settlementReference === "string" &&
    candidate.settlementReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    typeof candidate.amountReference === "string" &&
    candidate.amountReference.length > 0 &&
    typeof candidate.settlementKind === "string" &&
    isBookingSettlementKind(candidate.settlementKind)
  );
}

export function isSettlementDecision(
  value: unknown,
): value is SettlementDecision {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.settlementReference === "string" &&
    typeof candidate.amountReference === "string" &&
    typeof candidate.settlementStatus === "string" &&
    isBookingSettlementStatus(candidate.settlementStatus)
  );
}

export function isBookingSettlement(
  value: unknown,
): value is BookingSettlement {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingSettlement).evaluate === "function"
  );
}

export function isBookingSettlementPort(
  value: unknown,
): value is BookingSettlementPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingSettlementPort).evaluateSettlement === "function"
  );
}
