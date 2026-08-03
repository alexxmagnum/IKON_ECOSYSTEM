import type {
  BookingAuthorizationDecision,
  BookingAuthorizationGateway,
  BookingAuthorizationPolicy,
} from "@motanos/booking-lifecycle";
import { createBookingAuthorizationPolicy } from "@motanos/booking-lifecycle";
import {
  isAllowed,
  type AuthorizationService,
} from "@motanos/permissions-lifecycle";
import { failure } from "../../contracts/result";

/**
 * Adapt platform AuthorizationService → BookingAuthorizationGateway.
 */
export function createBookingAuthorizationGateway(
  authorization: AuthorizationService,
): BookingAuthorizationGateway {
  return {
    async authorize(input) {
      const result = await authorization.authorize({
        actor: input.actorReference,
        action: input.action,
        resource: {
          resourceType: input.resourceType,
          resourceReference: input.resourceReference,
        },
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      });
      return {
        allowed: isAllowed(result.decision),
        ...(result.decision.reason !== undefined
          ? { reason: result.decision.reason }
          : {}),
      };
    },
  };
}

export function createBookingAuthorizationPolicyFromAuthorization(
  authorization: AuthorizationService,
): BookingAuthorizationPolicy {
  return createBookingAuthorizationPolicy(
    createBookingAuthorizationGateway(authorization),
  );
}

export function forbiddenFromBookingPolicy(
  decision: BookingAuthorizationDecision,
  fallbackMessage: string,
) {
  return failure({
    code: "ForbiddenError",
    message: decision.reason ?? fallbackMessage,
    details: {
      decision: decision.code,
      operation: decision.operation,
      action: decision.action,
    },
  });
}
