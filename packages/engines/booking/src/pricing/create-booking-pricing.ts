import type {
  BookingPricing,
  BookingPricingRequest,
  PricingDecision,
} from "./booking-pricing";
import { isBookingPricingOperation } from "./booking-pricing";

export interface CreateBookingPricingOptions {
  /** Opaque pricing identity for decisions. */
  pricingReference?: string;
  /**
   * When set, pricing only evaluates requests for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
  /** Default opaque amount reference for allowed foundation decisions. */
  amountReference?: string;
  /** Default currency code for allowed foundation decisions. */
  currency?: string;
}

/**
 * Foundation BookingPricing — validates context and known operations.
 * Does not implement tax, coupons, promotions, billing, or payment capture.
 */
export function createBookingPricing(
  options: CreateBookingPricingOptions = {},
): BookingPricing {
  const boundTenant = options.tenantReference?.trim() || undefined;
  const pricingReference =
    options.pricingReference?.trim() || "booking-pricing-foundation";
  const defaultAmount =
    options.amountReference?.trim() || "amount-foundation";
  const defaultCurrency = options.currency?.trim() || "EUR";

  return {
    async evaluate(request: BookingPricingRequest): Promise<PricingDecision> {
      const tenantReference = request.tenantReference?.trim() ?? "";
      const actorReference = request.actorReference?.trim() ?? "";

      if (!tenantReference) {
        return deny(pricingReference, "tenantReference is required");
      }
      if (!actorReference) {
        return deny(pricingReference, "actorReference is required");
      }
      if (!isBookingPricingOperation(request.operation)) {
        return deny(
          pricingReference,
          `Unknown booking pricing operation: ${String(request.operation)}`,
        );
      }

      if (boundTenant !== undefined && tenantReference !== boundTenant) {
        return deny(
          pricingReference,
          "pricing does not apply to this tenant",
        );
      }

      if (
        request.bookingReference !== undefined &&
        !request.bookingReference.trim()
      ) {
        return deny(
          pricingReference,
          "bookingReference must not be empty when provided",
        );
      }
      if (
        request.resourceReference !== undefined &&
        !request.resourceReference.trim()
      ) {
        return deny(
          pricingReference,
          "resourceReference must not be empty when provided",
        );
      }
      if (
        request.membershipReference !== undefined &&
        !request.membershipReference.trim()
      ) {
        return deny(
          pricingReference,
          "membershipReference must not be empty when provided",
        );
      }

      return {
        allowed: true,
        amountReference: defaultAmount,
        currency: defaultCurrency,
        reason: "Booking operation has a foundation pricing decision",
        pricingReference,
      };
    },
  };
}

function deny(pricingReference: string, reason: string): PricingDecision {
  return {
    allowed: false,
    amountReference: "amount-none",
    currency: "XXX",
    reason,
    pricingReference,
  };
}
