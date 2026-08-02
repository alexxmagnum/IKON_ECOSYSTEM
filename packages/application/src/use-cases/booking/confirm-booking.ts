import type { BookingService } from "@motanos/booking";
import { canTransitionBooking } from "@motanos/booking";
import {
  isDenied,
  type AuthorizationService,
} from "@motanos/permissions";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { CONFIRM_BOOKING_ACTION } from "./actions";
import {
  toBookingOutput,
  type ConfirmBookingInput,
  type ConfirmBookingOutput,
} from "./types";

export interface ConfirmBookingUseCaseDeps {
  authorization: AuthorizationService;
  booking: BookingService;
}

export type ConfirmBookingUseCase = UseCase<
  ConfirmBookingInput,
  ConfirmBookingOutput
>;

/**
 * ConfirmBooking — Draft → Confirmed (booking.confirmed_without_payment).
 */
export function createConfirmBookingUseCase(
  deps: ConfirmBookingUseCaseDeps,
): ConfirmBookingUseCase {
  return {
    name: "ConfirmBooking",
    async execute(input, context) {
      if (!input.bookingReference?.trim()) {
        return failure({
          code: "ValidationError",
          message: "bookingReference is required",
        });
      }

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to confirm a booking",
        });
      }

      const current = await deps.booking.getById(input.bookingReference);
      if (!current) {
        return failure({
          code: "NotFoundError",
          message: "Booking not found",
          details: { bookingReference: input.bookingReference },
        });
      }

      const authorization = await deps.authorization.authorize({
        actor: context.actorReference,
        action: CONFIRM_BOOKING_ACTION,
        resource: {
          resourceType: "booking",
          resourceReference: current.booking.id,
        },
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (isDenied(authorization.decision)) {
        return failure({
          code: "ForbiddenError",
          message: authorization.decision.reason ?? "Booking confirm denied",
          details: {
            decision: authorization.decision.decision,
            ...(authorization.decision.metadata !== undefined
              ? { decisionMetadata: authorization.decision.metadata }
              : {}),
          },
        });
      }

      if (
        !canTransitionBooking(
          current.booking.status,
          "Confirmed",
          "booking.confirmed_without_payment",
        )
      ) {
        return failure({
          code: "FailedPreconditionError",
          message: `Cannot confirm booking from status ${current.booking.status}`,
          details: {
            from: current.booking.status,
            to: "Confirmed",
            event: "booking.confirmed_without_payment",
          },
        });
      }

      const result = await deps.booking.confirm({
        bookingId: input.bookingReference,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      });

      return success(toBookingOutput(result.booking), {
        ...(result.events !== undefined ? { events: result.events } : {}),
      });
    },
  };
}
