import type {
  BookingDiscount,
  BookingDiscountRequest,
  DiscountDecision,
} from "./booking-discount";
import { isBookingDiscountOperation } from "./booking-discount";

export interface CreateBookingDiscountOptions {
  /** Opaque discount identity used when a reduction applies. */
  discountReference?: string;
  /** Opaque reduction amount reference when a reduction applies. */
  discountAmountReference?: string;
  /**
   * When set, discount only evaluates requests for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
  /**
   * When true, valid evaluations apply a foundation discount.
   * Default false — no discount applied (foundation “no discount” case).
   */
  applyByDefault?: boolean;
}

/**
 * Foundation BookingDiscount — validates context and known operations.
 * Does not implement coupons, campaigns, loyalty points, or payment capture.
 */
export function createBookingDiscount(
  options: CreateBookingDiscountOptions = {},
): BookingDiscount {
  const boundTenant = options.tenantReference?.trim() || undefined;
  const discountReference =
    options.discountReference?.trim() || "discount-foundation";
  const discountAmountReference =
    options.discountAmountReference?.trim() || "discount-amount-foundation";
  const applyByDefault = options.applyByDefault === true;

  return {
    async evaluate(request: BookingDiscountRequest): Promise<DiscountDecision> {
      const tenantReference = request.tenantReference?.trim() ?? "";
      const actorReference = request.actorReference?.trim() ?? "";

      if (!tenantReference) {
        return reject("tenantReference is required");
      }
      if (!actorReference) {
        return reject("actorReference is required");
      }
      if (!isBookingDiscountOperation(request.operation)) {
        return reject(
          `Unknown booking discount operation: ${String(request.operation)}`,
        );
      }

      if (boundTenant !== undefined && tenantReference !== boundTenant) {
        return reject("discount does not apply to this tenant");
      }

      for (const [label, value] of [
        ["bookingReference", request.bookingReference],
        ["membershipReference", request.membershipReference],
        ["resourceReference", request.resourceReference],
        ["pricingReference", request.pricingReference],
      ] as const) {
        if (value !== undefined && !value.trim()) {
          return reject(`${label} must not be empty when provided`);
        }
      }

      if (!applyByDefault) {
        return {
          applied: false,
          reason: "No discount applies under foundation rules",
        };
      }

      return {
        applied: true,
        discountReference,
        discountAmountReference,
        reason: "Foundation discount applies",
      };
    },
  };
}

function reject(reason: string): DiscountDecision {
  return {
    applied: false,
    reason,
  };
}
