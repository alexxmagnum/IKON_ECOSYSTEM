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
 * 1) Validates booking auth request shape.
 * 2) Asks the Authorization gateway (platform AuthorizationService).
 * 3) Does not evaluate lifecycle / state-machine rules.
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
      if (!isBookingAuthOperation(request.operation)) {
        return denied(request, `Unknown booking operation: ${request.operation}`);
      }
      if (!request.resourceType?.trim() || !request.resourceReference?.trim()) {
        return denied(request, "resourceType and resourceReference are required");
      }

      const action = bookingAuthActionFor(request.operation);

      // Resource-scoped presence check only — not ownership RBAC / not status transitions.
      if (
        requiresBookingContext(request.operation) &&
        request.booking !== undefined &&
        request.booking.bookingReference !== request.resourceReference
      ) {
        return denied(
          request,
          "booking context does not match resourceReference",
          action,
        );
      }

      const result = await gateway.authorize({
        actorReference: request.actorReference.trim(),
        action,
        resourceType: request.resourceType,
        resourceReference: request.resourceReference,
        ...(request.metadata !== undefined
          ? { metadata: request.metadata }
          : {}),
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
