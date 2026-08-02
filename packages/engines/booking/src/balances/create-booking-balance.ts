import type {
  BalanceDecision,
  BookingBalance,
  BookingBalanceKind,
  BookingBalanceRequest,
  BookingBalanceStatus,
  CreateBookingBalanceRequestInput,
} from "./booking-balance";
import {
  BOOKING_BALANCE_STATUSES,
  isBookingBalanceKind,
  isBookingBalanceStatus,
} from "./booking-balance";

let balanceSequence = 0;

export interface CreateBookingBalanceOptions {
  /**
   * When set, balance only evaluates requests for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
  /**
   * Status returned for valid foundation evaluations.
   * Default `pending` — outstanding economic state without settlement.
   */
  defaultStatus?: BookingBalanceStatus;
}

/**
 * Build a validated BookingBalanceRequest (in-memory — no ledger / wallet).
 */
export function createBookingBalanceRequest(
  input: CreateBookingBalanceRequestInput,
): BookingBalanceRequest {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const amountReference = input.amountReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!amountReference) {
    throw new Error("amountReference is required");
  }
  if (!isBookingBalanceKind(input.balanceKind)) {
    throw new Error(
      `Unknown booking balance kind: ${String(input.balanceKind)}`,
    );
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const balanceKind: BookingBalanceKind = input.balanceKind;
  const balanceReference =
    input.balanceReference?.trim() || allocateBalanceReference();

  return {
    balanceReference,
    tenantReference,
    amountReference,
    balanceKind,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

/**
 * Foundation BookingBalance — validates context and known kinds/statuses.
 * Does not implement wallets, ledgers, reconciliation, or payment capture.
 */
export function createBookingBalance(
  options: CreateBookingBalanceOptions = {},
): BookingBalance {
  const boundTenant = options.tenantReference?.trim() || undefined;
  const defaultStatus: BookingBalanceStatus =
    options.defaultStatus ?? BOOKING_BALANCE_STATUSES.Pending;

  if (!isBookingBalanceStatus(defaultStatus)) {
    throw new Error(
      `Unknown booking balance status: ${String(options.defaultStatus)}`,
    );
  }

  return {
    async evaluate(request: BookingBalanceRequest): Promise<BalanceDecision> {
      const tenantReference = request.tenantReference?.trim() ?? "";
      const amountReference = request.amountReference?.trim() ?? "";
      const balanceReference = request.balanceReference?.trim() ?? "";

      if (!tenantReference) {
        return decide(
          "balance-none",
          "amount-none",
          BOOKING_BALANCE_STATUSES.Cancelled,
          "tenantReference is required",
        );
      }
      if (!balanceReference) {
        return decide(
          "balance-none",
          amountReference || "amount-none",
          BOOKING_BALANCE_STATUSES.Cancelled,
          "balanceReference is required",
        );
      }
      if (!amountReference) {
        return decide(
          balanceReference,
          "amount-none",
          BOOKING_BALANCE_STATUSES.Cancelled,
          "amountReference is required",
        );
      }
      if (!isBookingBalanceKind(request.balanceKind)) {
        return decide(
          balanceReference,
          amountReference,
          BOOKING_BALANCE_STATUSES.Cancelled,
          `Unknown booking balance kind: ${String(request.balanceKind)}`,
        );
      }

      if (boundTenant !== undefined && tenantReference !== boundTenant) {
        return decide(
          balanceReference,
          amountReference,
          BOOKING_BALANCE_STATUSES.Cancelled,
          "balance does not apply to this tenant",
        );
      }

      return decide(
        balanceReference,
        amountReference,
        defaultStatus,
        "Foundation balance decision",
      );
    },
  };
}

function decide(
  balanceReference: string,
  amountReference: string,
  balanceStatus: BookingBalanceStatus,
  reason: string,
): BalanceDecision {
  return {
    balanceReference,
    amountReference,
    balanceStatus,
    reason,
  };
}

function allocateBalanceReference(): string {
  balanceSequence += 1;
  return `balance-${balanceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingBalanceReferenceSequence(): void {
  balanceSequence = 0;
}
