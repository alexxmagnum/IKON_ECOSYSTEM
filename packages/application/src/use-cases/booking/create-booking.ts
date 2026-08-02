import type {
  BookingService,
  CreateBookingInput as BookingEngineCreateInput,
} from "@motanos/booking";
import { DEFAULT_HOLD_TTL_MINUTES } from "@motanos/booking";
import {
  isDenied,
  type AuthorizationService,
} from "@motanos/permissions";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { CREATE_BOOKING_ACTION } from "./actions";
import type { CreateBookingInput, CreateBookingOutput } from "./types";

export interface CreateBookingUseCaseDeps {
  authorization: AuthorizationService;
  booking: BookingService;
}

export type CreateBookingUseCase = UseCase<
  CreateBookingInput,
  CreateBookingOutput
>;

/**
 * CreateBooking vertical slice.
 * Flow: ExecutionContext → AuthorizationService → BookingService → ApplicationResult.
 * No persistence or transport in this use case.
 */
export function createCreateBookingUseCase(
  deps: CreateBookingUseCaseDeps,
): CreateBookingUseCase {
  return {
    name: "CreateBooking",
    async execute(input, context) {
      const validationError = validateCreateBookingInput(input);
      if (validationError) {
        return failure(validationError);
      }

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to create a booking",
        });
      }

      const authorization = await deps.authorization.authorize({
        actor: context.actorReference,
        action: CREATE_BOOKING_ACTION,
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
          message: authorization.decision.reason ?? "Booking create denied",
          details: {
            decision: authorization.decision.decision,
            ...(authorization.decision.metadata !== undefined
              ? { decisionMetadata: authorization.decision.metadata }
              : {}),
          },
        });
      }

      const engineInput = toBookingEngineInput(input);
      const result = await deps.booking.create(engineInput);

      return success(toCreateBookingOutput(result.booking));
    },
  };
}

function validateCreateBookingInput(
  input: CreateBookingInput,
): { code: "ValidationError"; message: string; details?: Record<string, unknown> } | null {
  if (!input.resourceReference?.trim()) {
    return {
      code: "ValidationError",
      message: "resourceReference is required",
    };
  }
  if (!input.customerReference?.trim()) {
    return {
      code: "ValidationError",
      message: "customerReference is required",
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

function toBookingEngineInput(
  input: CreateBookingInput,
): BookingEngineCreateInput {
  return {
    resourceId: input.resourceReference,
    ownerUserId: input.customerReference,
    startsAt: input.startAt,
    endsAt: input.endAt,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function toCreateBookingOutput(
  booking: {
    id: string;
    resourceId: string;
    ownerUserId: string;
    startsAt: string;
    endsAt: string;
    status: CreateBookingOutput["status"];
    holdExpiresAt?: string;
    metadata?: Record<string, unknown>;
  },
): CreateBookingOutput {
  return {
    bookingReference: booking.id,
    resourceReference: booking.resourceId,
    customerReference: booking.ownerUserId,
    startAt: booking.startsAt,
    endAt: booking.endsAt,
    status: booking.status,
    ...(booking.holdExpiresAt !== undefined
      ? { holdExpiresAt: booking.holdExpiresAt }
      : {}),
    ...(booking.metadata !== undefined ? { metadata: booking.metadata } : {}),
  };
}

/** Expose hold TTL constant for adapters/tests that mirror Draft holds (BR-0037). */
export { DEFAULT_HOLD_TTL_MINUTES };
