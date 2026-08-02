import type { BookingService } from "@motanos/booking";
import {
  isDenied,
  type AuthorizationService,
} from "@motanos/permissions";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { CHECK_AVAILABILITY_ACTION } from "./actions";

export interface CheckAvailabilityInput {
  resourceReference: string;
  startAt: string;
  endAt: string;
  metadata?: Record<string, unknown>;
}

export interface CheckAvailabilityOutput {
  available: boolean;
  resourceReference: string;
  startAt: string;
  endAt: string;
  reason?: string;
}

export interface CheckAvailabilityUseCaseDeps {
  authorization: AuthorizationService;
  booking: BookingService;
}

export type CheckAvailabilityUseCase = UseCase<
  CheckAvailabilityInput,
  CheckAvailabilityOutput
>;

/**
 * CheckAvailability — asks Booking Engine whether a resource interval is free.
 */
export function createCheckAvailabilityUseCase(
  deps: CheckAvailabilityUseCaseDeps,
): CheckAvailabilityUseCase {
  return {
    name: "CheckAvailability",
    async execute(input, context) {
      const validationError = validateCheckAvailabilityInput(input);
      if (validationError) {
        return failure(validationError);
      }

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to check availability",
        });
      }

      const authorization = await deps.authorization.authorize({
        actor: context.actorReference,
        action: CHECK_AVAILABILITY_ACTION,
        resource: {
          resourceType: "booking.resource",
          resourceReference: input.resourceReference,
        },
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (isDenied(authorization.decision)) {
        return failure({
          code: "ForbiddenError",
          message:
            authorization.decision.reason ?? "Availability check denied",
          details: {
            decision: authorization.decision.decision,
            ...(authorization.decision.metadata !== undefined
              ? { decisionMetadata: authorization.decision.metadata }
              : {}),
          },
        });
      }

      const result = await deps.booking.checkAvailability({
        resourceId: input.resourceReference,
        startsAt: input.startAt,
        endsAt: input.endAt,
      });

      return success({
        available: result.available,
        resourceReference: result.resourceId,
        startAt: result.startsAt,
        endAt: result.endsAt,
        ...(result.reason !== undefined ? { reason: result.reason } : {}),
      });
    },
  };
}

function validateCheckAvailabilityInput(
  input: CheckAvailabilityInput,
): {
  code: "ValidationError";
  message: string;
  details?: Record<string, unknown>;
} | null {
  if (!input.resourceReference?.trim()) {
    return {
      code: "ValidationError",
      message: "resourceReference is required",
    };
  }
  if (!input.startAt?.trim() || !input.endAt?.trim()) {
    return {
      code: "ValidationError",
      message: "startAt and endAt are required",
    };
  }

  const start = Date.parse(input.startAt);
  const end = Date.parse(input.endAt);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return {
      code: "ValidationError",
      message: "startAt and endAt must be valid ISO-8601 timestamps",
    };
  }
  if (end <= start) {
    return {
      code: "ValidationError",
      message: "endAt must be after startAt",
      details: { startAt: input.startAt, endAt: input.endAt },
    };
  }

  return null;
}
