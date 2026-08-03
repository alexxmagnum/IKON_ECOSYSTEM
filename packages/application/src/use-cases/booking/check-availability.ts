import type {
  BookingAuthorizationPolicy,
  BookingQueryService,
} from "@motanos/booking-lifecycle";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { forbiddenFromBookingPolicy } from "./booking-auth";

export interface CheckAvailabilityInput {
  tenantReference: string;
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
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  bookingQuery: BookingQueryService;
}

export type CheckAvailabilityUseCase = UseCase<
  CheckAvailabilityInput,
  CheckAvailabilityOutput
>;

/**
 * CheckAvailability — Policy → BookingQueryService.checkAvailability.
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

      const tenantReference = input.tenantReference.trim();

      const decision = await deps.bookingAuthorizationPolicy.decide({
        actorReference: context.actorReference,
        tenantReference,
        operation: "checkAvailability",
        resourceType: "booking.resource",
        resourceReference: input.resourceReference,
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (!decision.allowed) {
        return forbiddenFromBookingPolicy(
          decision,
          "Availability check denied",
        );
      }

      const result = await deps.bookingQuery.checkAvailability({
        tenantReference,
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
  if (!input.tenantReference?.trim()) {
    return {
      code: "ValidationError",
      message: "tenantReference is required",
    };
  }
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
