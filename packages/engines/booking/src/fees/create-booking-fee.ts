import type {
  BookingFee,
  BookingFeeKind,
  BookingFeeRequest,
  CreateBookingFeeRequestInput,
  FeeDecision,
} from "./booking-fee";
import { isBookingFeeKind } from "./booking-fee";

let feeSequence = 0;

export interface CreateBookingFeeOptions {
  /**
   * When set, fee only evaluates requests for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
  /**
   * When true, valid evaluations mark fee as applicable.
   * Default false — not applicable (foundation deferred calculation).
   */
  applicableByDefault?: boolean;
}

/**
 * Build a validated BookingFeeRequest (in-memory — no fee calculation).
 */
export function createBookingFeeRequest(
  input: CreateBookingFeeRequestInput,
): BookingFeeRequest {
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
  if (!isBookingFeeKind(input.feeKind)) {
    throw new Error(`Unknown booking fee kind: ${String(input.feeKind)}`);
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const feeKind: BookingFeeKind = input.feeKind;
  const feeReference = input.feeReference?.trim() || allocateFeeReference();

  return {
    feeReference,
    tenantReference,
    amountReference,
    feeKind,
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
 * Foundation BookingFee — validates context and known kinds.
 * Does not implement commercial commission math, billing lines, or payment capture.
 */
export function createBookingFee(
  options: CreateBookingFeeOptions = {},
): BookingFee {
  const boundTenant = options.tenantReference?.trim() || undefined;
  const applicableByDefault = options.applicableByDefault === true;

  return {
    async evaluate(request: BookingFeeRequest): Promise<FeeDecision> {
      const tenantReference = request.tenantReference?.trim() ?? "";
      const amountReference = request.amountReference?.trim() ?? "";
      const feeReference = request.feeReference?.trim() ?? "";

      if (!tenantReference) {
        return decide(
          false,
          "fee-none",
          "amount-none",
          "tenantReference is required",
        );
      }
      if (!feeReference) {
        return decide(
          false,
          "fee-none",
          amountReference || "amount-none",
          "feeReference is required",
        );
      }
      if (!amountReference) {
        return decide(
          false,
          feeReference,
          "amount-none",
          "amountReference is required",
        );
      }
      if (!isBookingFeeKind(request.feeKind)) {
        return decide(
          false,
          feeReference,
          amountReference,
          `Unknown booking fee kind: ${String(request.feeKind)}`,
        );
      }

      if (boundTenant !== undefined && tenantReference !== boundTenant) {
        return decide(
          false,
          feeReference,
          amountReference,
          "fee does not apply to this tenant",
        );
      }

      if (!applicableByDefault) {
        return decide(
          false,
          feeReference,
          amountReference,
          "No fee applies under foundation rules",
        );
      }

      return decide(
        true,
        feeReference,
        amountReference,
        "Foundation fee applies",
      );
    },
  };
}

function decide(
  feeApplicable: boolean,
  feeReference: string,
  amountReference: string,
  reason: string,
): FeeDecision {
  return {
    feeApplicable,
    feeReference,
    amountReference,
    reason,
  };
}

function allocateFeeReference(): string {
  feeSequence += 1;
  return `fee-${feeSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingFeeReferenceSequence(): void {
  feeSequence = 0;
}
