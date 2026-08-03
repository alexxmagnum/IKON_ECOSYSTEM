import type {
  BookingAuthorizationDecision,
  BookingAuthorizationGateway,
  BookingAuthorizationPolicy,
  BookingAuthorizationRequest,
} from "./booking-authorization-policy";
import {
  bookingAuthActionFor,
  isBookingAuthOperation,
} from "./booking-authorization-policy";

/**
 * Default BookingAuthorizationPolicy.
 * Actor + tenant scope → gateway AuthorizationService.
 * Does not evaluate lifecycle / state-machine rules.
 */
export function createBookingAuthorizationPolicy(
  gateway: BookingAuthorizationGateway,
): BookingAuthorizationPolicy {
  return {
    async decide(
      request: BookingAuthorizationRequest,
    ): Promise<BookingAuthorizationDecision> {
      if (!request.actorReference?.trim()) {
        return denied(request, "actorReference is required");
      }
      if (!request.tenantReference?.trim()) {
        return denied(request, "tenantReference is required");
      }
      if (!isBookingAuthOperation(request.operation)) {
        return denied(request, `Unknown booking operation: ${request.operation}`);
      }
      if (!request.resourceType?.trim() || !request.resourceReference?.trim()) {
        return denied(request, "resourceType and resourceReference are required");
      }

      const action = bookingAuthActionFor(request.operation);
      const tenantReference = request.tenantReference.trim();

      if (
        requiresBookingContext(request.operation) &&
        request.booking !== undefined
      ) {
        if (request.booking.bookingReference !== request.resourceReference) {
          return denied(
            request,
            "booking context does not match resourceReference",
            action,
          );
        }
        if (request.booking.tenantReference !== tenantReference) {
          return denied(
            request,
            "booking does not belong to tenant context",
            action,
          );
        }
      }

      const result = await gateway.authorize({
        actorReference: request.actorReference.trim(),
        action,
        resourceType: request.resourceType,
        resourceReference: request.resourceReference,
        metadata: {
          ...(request.metadata ?? {}),
          tenantReference,
        },
      });

      if (!result.allowed) {
        return {
          allowed: false,
          code: "Denied",
          action,
          operation: request.operation,
          reason: result.reason ?? "Booking operation denied",
        };
      }

      return {
        allowed: true,
        code: "Allowed",
        action,
        operation: request.operation,
        reason: result.reason ?? "Booking operation permitted",
      };
    },
  };
}

function requiresBookingContext(
  operation: BookingAuthorizationRequest["operation"],
): boolean {
  return (
    operation === "confirm" ||
    operation === "cancel" ||
    operation === "reschedule" ||
    operation === "read"
  );
}

function denied(
  request: BookingAuthorizationRequest,
  reason: string,
  action = isBookingAuthOperation(request.operation)
    ? bookingAuthActionFor(request.operation)
    : bookingAuthActionFor("read"),
): BookingAuthorizationDecision {
  return {
    allowed: false,
    code: "Denied",
    action,
    operation: isBookingAuthOperation(request.operation)
      ? request.operation
      : "read",
    reason,
  };
}
