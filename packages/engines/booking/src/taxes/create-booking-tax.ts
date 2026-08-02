import type {
  BookingTax,
  BookingTaxKind,
  BookingTaxRequest,
  CreateBookingTaxRequestInput,
  TaxDecision,
} from "./booking-tax";
import { isBookingTaxKind } from "./booking-tax";

let taxSequence = 0;

export interface CreateBookingTaxOptions {
  /**
   * When set, tax only evaluates requests for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
  /**
   * When true, valid evaluations mark tax as applicable.
   * Default false — not applicable (foundation deferred calculation).
   */
  applicableByDefault?: boolean;
}

/**
 * Build a validated BookingTaxRequest (in-memory — no fiscal calculation).
 */
export function createBookingTaxRequest(
  input: CreateBookingTaxRequestInput,
): BookingTaxRequest {
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
  if (!isBookingTaxKind(input.taxKind)) {
    throw new Error(`Unknown booking tax kind: ${String(input.taxKind)}`);
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const taxKind: BookingTaxKind = input.taxKind;
  const taxReference =
    input.taxReference?.trim() || allocateTaxReference();

  return {
    taxReference,
    tenantReference,
    amountReference,
    taxKind,
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
 * Foundation BookingTax — validates context and known kinds.
 * Does not implement legal tax math, country rules, or external tax authorities.
 */
export function createBookingTax(
  options: CreateBookingTaxOptions = {},
): BookingTax {
  const boundTenant = options.tenantReference?.trim() || undefined;
  const applicableByDefault = options.applicableByDefault === true;

  return {
    async evaluate(request: BookingTaxRequest): Promise<TaxDecision> {
      const tenantReference = request.tenantReference?.trim() ?? "";
      const amountReference = request.amountReference?.trim() ?? "";
      const taxReference = request.taxReference?.trim() ?? "";

      if (!tenantReference) {
        return decide(false, "tax-none", "amount-none", "tenantReference is required");
      }
      if (!taxReference) {
        return decide(
          false,
          "tax-none",
          amountReference || "amount-none",
          "taxReference is required",
        );
      }
      if (!amountReference) {
        return decide(false, taxReference, "amount-none", "amountReference is required");
      }
      if (!isBookingTaxKind(request.taxKind)) {
        return decide(
          false,
          taxReference,
          amountReference,
          `Unknown booking tax kind: ${String(request.taxKind)}`,
        );
      }

      if (boundTenant !== undefined && tenantReference !== boundTenant) {
        return decide(
          false,
          taxReference,
          amountReference,
          "tax does not apply to this tenant",
        );
      }

      if (!applicableByDefault) {
        return decide(
          false,
          taxReference,
          amountReference,
          "No tax applies under foundation rules",
        );
      }

      return decide(
        true,
        taxReference,
        amountReference,
        "Foundation tax applies",
      );
    },
  };
}

function decide(
  taxApplicable: boolean,
  taxReference: string,
  amountReference: string,
  reason: string,
): TaxDecision {
  return {
    taxApplicable,
    taxReference,
    amountReference,
    reason,
  };
}

function allocateTaxReference(): string {
  taxSequence += 1;
  return `tax-${taxSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingTaxReferenceSequence(): void {
  taxSequence = 0;
}
