import type { BookingService } from "@motanos/booking";
import { canRescheduleBooking } from "@motanos/booking";
import {
  isDenied,
  type AuthorizationService,
} from "@motanos/permissions";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { RESCHEDULE_BOOKING_ACTION } from "./actions";
import { normalizeReference } from "./normalize";
import {
  toBookingOutput,
  type RescheduleBookingInput,
  type RescheduleBookingOutput,
} from "./types";

export interface RescheduleBookingUseCaseDeps {
  authorization: AuthorizationService;
  booking: BookingService;
}

export type RescheduleBookingUseCase = UseCase<
  RescheduleBookingInput,
  RescheduleBookingOutput
>;

/**
 * RescheduleBooking — auth-first time-window update via BookingService.reschedule.
 */
export function createRescheduleBookingUseCase(
  deps: RescheduleBookingUseCaseDeps,
): RescheduleBookingUseCase {
  return {
    name: "RescheduleBooking",
    async execute(input, context) {
      const validationError = validateRescheduleInput(input);
      if (validationError) {
        return failure(validationError);
      }

      const bookingReference = normalizeReference(input.bookingReference);
      const newStartAt = normalizeReference(input.newStartAt);
      const newEndAt = normalizeReference(input.newEndAt);

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to reschedule a booking",
        });
      }

      const actorReference = normalizeReference(context.actorReference);
      if (!actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to reschedule a booking",
        });
      }

      const authorization = await deps.authorization.authorize({
        actor: actorReference,
        action: RESCHEDULE_BOOKING_ACTION,
        resource: {
          resourceType: "booking",
          resourceReference: bookingReference,
        },
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (isDenied(authorization.decision)) {
        return failure({
          code: "ForbiddenError",
          message:
            authorization.decision.reason ?? "Booking reschedule denied",
          details: {
            decision: authorization.decision.decision,
            ...(authorization.decision.metadata !== undefined
              ? { decisionMetadata: authorization.decision.metadata }
              : {}),
          },
        });
      }

      const current = await deps.booking.getById(bookingReference);
      if (!current) {
        return failure({
          code: "NotFoundError",
          message: "Booking not found",
          details: { bookingReference },
        });
      }

      if (!canRescheduleBooking(current.booking.status)) {
        return failure({
          code: "FailedPreconditionError",
          message: `Cannot reschedule booking from status ${current.booking.status}`,
          details: {
            bookingReference,
            status: current.booking.status,
          },
        });
      }

      try {
        const result = await deps.booking.reschedule({
          bookingId: bookingReference,
          startsAt: newStartAt,
          endsAt: newEndAt,
          ...(input.metadata !== undefined
            ? { metadata: input.metadata }
            : {}),
        });
        return success(toBookingOutput(result.booking));
      } catch (err) {
        return mapRescheduleEngineError(err, bookingReference);
      }
    },
  };
}

function validateRescheduleInput(input: RescheduleBookingInput): {
  code: "ValidationError";
  message: string;
  details?: Record<string, unknown>;
} | null {
  if (!input.bookingReference?.trim()) {
    return {
      code: "ValidationError",
      message: "bookingReference is required",
    };
  }
  if (!input.newStartAt?.trim() || !input.newEndAt?.trim()) {
    return {
      code: "ValidationError",
      message: "newStartAt and newEndAt are required",
    };
  }
  const start = Date.parse(input.newStartAt.trim());
  const end = Date.parse(input.newEndAt.trim());
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return {
      code: "ValidationError",
      message: "newStartAt and newEndAt must be valid ISO-8601 timestamps",
    };
  }
  if (end <= start) {
    return {
      code: "ValidationError",
      message: "newEndAt must be after newStartAt",
      details: {
        newStartAt: input.newStartAt,
        newEndAt: input.newEndAt,
      },
    };
  }
  return null;
}

function mapRescheduleEngineError(
  err: unknown,
  bookingReference: string,
): ReturnType<typeof failure> {
  const message = err instanceof Error ? err.message : String(err);
  if (message.startsWith("CONFLICT:")) {
    return failure({
      code: "ConflictError",
      message: "New booking window conflicts with existing availability",
      details: {
        bookingReference,
        reason: message.slice("CONFLICT:".length),
      },
    });
  }
  if (message.startsWith("PRECONDITION:")) {
    return failure({
      code: "FailedPreconditionError",
      message: message.slice("PRECONDITION:".length),
      details: { bookingReference },
    });
  }
  if (message.includes("not found") || message.startsWith("NOT_FOUND:")) {
    return failure({
      code: "NotFoundError",
      message: "Booking not found",
      details: { bookingReference },
    });
  }
  return failure({
    code: "InternalError",
    message: "Reschedule failed",
    details: { bookingReference, cause: message },
  });
}
