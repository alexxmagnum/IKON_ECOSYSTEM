import type {
  BookingSettlement,
  BookingSettlementKind,
  BookingSettlementRequest,
  BookingSettlementStatus,
  CreateBookingSettlementRequestInput,
  SettlementDecision,
} from "./booking-settlement";
import {
  BOOKING_SETTLEMENT_STATUSES,
  isBookingSettlementKind,
  isBookingSettlementStatus,
} from "./booking-settlement";

let settlementSequence = 0;

export interface CreateBookingSettlementOptions {
  /**
   * When set, settlement only evaluates requests for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
  /**
   * Status returned for valid foundation evaluations.
   * Default `pending` — liquidation not yet finalized.
   */
  defaultStatus?: BookingSettlementStatus;
}

/**
 * Build a validated BookingSettlementRequest (in-memory — no ledger / bank).
 */
export function createBookingSettlementRequest(
  input: CreateBookingSettlementRequestInput,
): BookingSettlementRequest {
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
  if (!isBookingSettlementKind(input.settlementKind)) {
    throw new Error(
      `Unknown booking settlement kind: ${String(input.settlementKind)}`,
    );
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const settlementKind: BookingSettlementKind = input.settlementKind;
  const settlementReference =
    input.settlementReference?.trim() || allocateSettlementReference();

  return {
    settlementReference,
    tenantReference,
    amountReference,
    settlementKind,
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
 * Foundation BookingSettlement — validates context and known kinds/statuses.
 * Does not implement accounting, bank reconciliation, ledgers, or payment capture.
 */
export function createBookingSettlement(
  options: CreateBookingSettlementOptions = {},
): BookingSettlement {
  const boundTenant = options.tenantReference?.trim() || undefined;
  const defaultStatus: BookingSettlementStatus =
    options.defaultStatus ?? BOOKING_SETTLEMENT_STATUSES.Pending;

  if (!isBookingSettlementStatus(defaultStatus)) {
    throw new Error(
      `Unknown booking settlement status: ${String(options.defaultStatus)}`,
    );
  }

  return {
    async evaluate(
      request: BookingSettlementRequest,
    ): Promise<SettlementDecision> {
      const tenantReference = request.tenantReference?.trim() ?? "";
      const amountReference = request.amountReference?.trim() ?? "";
      const settlementReference = request.settlementReference?.trim() ?? "";

      if (!tenantReference) {
        return decide(
          "settlement-none",
          "amount-none",
          BOOKING_SETTLEMENT_STATUSES.Cancelled,
          "tenantReference is required",
        );
      }
      if (!settlementReference) {
        return decide(
          "settlement-none",
          amountReference || "amount-none",
          BOOKING_SETTLEMENT_STATUSES.Cancelled,
          "settlementReference is required",
        );
      }
      if (!amountReference) {
        return decide(
          settlementReference,
          "amount-none",
          BOOKING_SETTLEMENT_STATUSES.Cancelled,
          "amountReference is required",
        );
      }
      if (!isBookingSettlementKind(request.settlementKind)) {
        return decide(
          settlementReference,
          amountReference,
          BOOKING_SETTLEMENT_STATUSES.Cancelled,
          `Unknown booking settlement kind: ${String(request.settlementKind)}`,
        );
      }

      if (boundTenant !== undefined && tenantReference !== boundTenant) {
        return decide(
          settlementReference,
          amountReference,
          BOOKING_SETTLEMENT_STATUSES.Cancelled,
          "settlement does not apply to this tenant",
        );
      }

      return decide(
        settlementReference,
        amountReference,
        defaultStatus,
        "Foundation settlement decision",
      );
    },
  };
}

function decide(
  settlementReference: string,
  amountReference: string,
  settlementStatus: BookingSettlementStatus,
  reason: string,
): SettlementDecision {
  return {
    settlementReference,
    amountReference,
    settlementStatus,
    reason,
  };
}

function allocateSettlementReference(): string {
  settlementSequence += 1;
  return `settlement-${settlementSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingSettlementReferenceSequence(): void {
  settlementSequence = 0;
}
