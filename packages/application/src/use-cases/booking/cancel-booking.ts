import type { BookingService } from "@motanos/booking";
import { canTransitionBooking } from "@motanos/booking";
import {
  isDenied,
  type AuthorizationService,
} from "@motanos/permissions";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { CANCEL_BOOKING_ACTION } from "./actions";
import {
  toBookingOutput,
  type CancelBookingInput,
  type CancelBookingOutput,
} from "./types";

export interface CancelBookingUseCaseDeps {
  authorization: AuthorizationService;
  booking: BookingService;
}

export type CancelBookingUseCase = UseCase<
  CancelBookingInput,
  CancelBookingOutput
>;

/**
 * CancelBooking — → Cancelled via booking.cancelled_by_user when allowed by SoT.
 */
export function createCancelBookingUseCase(
  deps: CancelBookingUseCaseDeps,
): CancelBookingUseCase {
  return {
    name: "CancelBooking",
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
          message: "actorReference is required to cancel a booking",
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
        action: CANCEL_BOOKING_ACTION,
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
          message: authorization.decision.reason ?? "Booking cancel denied",
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
          "Cancelled",
          "booking.cancelled_by_user",
        )
      ) {
        return failure({
          code: "FailedPreconditionError",
          message: `Cannot cancel booking from status ${current.booking.status}`,
          details: {
            from: current.booking.status,
            to: "Cancelled",
            event: "booking.cancelled_by_user",
          },
        });
      }

      const result = await deps.booking.cancel({
        bookingId: input.bookingReference,
        ...(input.reason !== undefined ? { reason: input.reason } : {}),
      });

      return success(toBookingOutput(result.booking), {
        ...(result.events !== undefined ? { events: result.events } : {}),
      });
    },
  };
}
