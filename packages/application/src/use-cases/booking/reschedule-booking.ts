import type {
  BookingAuthorizationPolicy,
  BookingQueryService,
  BookingService,
} from "@motanos/booking";
import { canRescheduleBooking } from "@motanos/booking";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { forbiddenFromBookingPolicy } from "./booking-auth";
import { normalizeReference } from "./normalize";
import {
  toBookingOutput,
  type RescheduleBookingInput,
  type RescheduleBookingOutput,
} from "./types";

export interface RescheduleBookingUseCaseDeps {
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  booking: BookingService;
  bookingQuery: BookingQueryService;
}

export type RescheduleBookingUseCase = UseCase<
  RescheduleBookingInput,
  RescheduleBookingOutput
>;

/**
 * RescheduleBooking — Policy (auth-first) → domain eligibility → BookingService.
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

      const tenantReference = normalizeReference(input.tenantReference);
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

      const decision = await deps.bookingAuthorizationPolicy.decide({
        actorReference,
        tenantReference,
        operation: "reschedule",
        resourceType: "booking",
        resourceReference: bookingReference,
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (!decision.allowed) {
        return forbiddenFromBookingPolicy(
          decision,
          "Booking reschedule denied",
        );
      }

      const current = await deps.bookingQuery.getBooking(
        tenantReference,
        bookingReference,
      );
      if (!current) {
        return failure({
          code: "NotFoundError",
          message: "Booking not found",
          details: { bookingReference },
        });
      }

      if (!canRescheduleBooking(current.status)) {
        return failure({
          code: "FailedPreconditionError",
          message: `Cannot reschedule booking from status ${current.status}`,
          details: {
            bookingReference,
            status: current.status,
          },
        });
      }

      try {
        const result = await deps.booking.reschedule({
          tenantReference,
          bookingId: bookingReference,
          startsAt: newStartAt,
          endsAt: newEndAt,
          ...(input.metadata !== undefined
            ? { metadata: input.metadata }
            : {}),
        });
        return success(toBookingOutput(result.booking), {
          ...(result.events !== undefined ? { events: result.events } : {}),
        });
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
  if (!input.tenantReference?.trim()) {
    return {
      code: "ValidationError",
      message: "tenantReference is required",
    };
  }
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
