import type {
  BookingPolicy,
  BookingPolicyRequest,
  PolicyDecision,
} from "./booking-policy";
import { isBookingPolicyOperation } from "./booking-policy";

export interface CreateBookingPolicyOptions {
  /** Opaque policy identity for decisions. */
  policyReference?: string;
  /**
   * When set, the policy only evaluates requests for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Foundation BookingPolicy — validates context and known operations.
 * Does not implement a rules engine, pricing, or external configuration.
 * Does not decide Authorization permissions or Domain state transitions.
 */
export function createBookingPolicy(
  options: CreateBookingPolicyOptions = {},
): BookingPolicy {
  const boundTenant = options.tenantReference?.trim() || undefined;
  const policyReference =
    options.policyReference?.trim() || "booking-policy-foundation";

  return {
    async evaluate(request: BookingPolicyRequest): Promise<PolicyDecision> {
      const tenantReference = request.tenantReference?.trim() ?? "";
      const actorReference = request.actorReference?.trim() ?? "";

      if (!tenantReference) {
        return deny(policyReference, "tenantReference is required");
      }
      if (!actorReference) {
        return deny(policyReference, "actorReference is required");
      }
      if (!isBookingPolicyOperation(request.operation)) {
        return deny(
          policyReference,
          `Unknown booking policy operation: ${String(request.operation)}`,
        );
      }

      if (boundTenant !== undefined && tenantReference !== boundTenant) {
        return deny(
          policyReference,
          "policy does not apply to this tenant",
        );
      }

      const bookingTenant = request.bookingTenantReference?.trim();
      if (bookingTenant !== undefined && bookingTenant.length > 0) {
        if (bookingTenant !== tenantReference) {
          return deny(
            policyReference,
            "booking does not belong to tenant context",
          );
        }
      }

      if (
        request.bookingReference !== undefined &&
        !request.bookingReference.trim()
      ) {
        return deny(
          policyReference,
          "bookingReference must not be empty when provided",
        );
      }

      return {
        allowed: true,
        reason: "Booking operation meets foundation policy conditions",
        policyReference,
      };
    },
  };
}

function deny(policyReference: string, reason: string): PolicyDecision {
  return {
    allowed: false,
    reason,
    policyReference,
  };
}
