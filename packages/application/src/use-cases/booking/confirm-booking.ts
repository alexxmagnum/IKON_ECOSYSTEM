import type {
  BookingAuthorizationPolicy,
  BookingQueryService,
  BookingService,
} from "@motanos/booking";
import { canTransitionBooking } from "@motanos/booking";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { forbiddenFromBookingPolicy } from "./booking-auth";
import {
  toBookingOutput,
  type ConfirmBookingInput,
  type ConfirmBookingOutput,
} from "./types";

export interface ConfirmBookingUseCaseDeps {
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  booking: BookingService;
  bookingQuery: BookingQueryService;
}

export type ConfirmBookingUseCase = UseCase<
  ConfirmBookingInput,
  ConfirmBookingOutput
>;

/**
 * ConfirmBooking — Policy → domain transition check → BookingService.confirm.
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

      const current = await deps.bookingQuery.getBooking(
        input.bookingReference,
      );
      if (!current) {
        return failure({
          code: "NotFoundError",
          message: "Booking not found",
          details: { bookingReference: input.bookingReference },
        });
      }

      const decision = await deps.bookingAuthorizationPolicy.decide({
        actorReference: context.actorReference,
        operation: "confirm",
        resourceType: "booking",
        resourceReference: current.id,
        booking: {
          bookingReference: current.id,
          ownerUserId: current.ownerUserId,
          resourceId: current.resourceId,
          status: current.status,
        },
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (!decision.allowed) {
        return forbiddenFromBookingPolicy(decision, "Booking confirm denied");
      }

      // Domain rule (not authorization): lifecycle transition eligibility
      if (
        !canTransitionBooking(
          current.status,
          "Confirmed",
          "booking.confirmed_without_payment",
        )
      ) {
        return failure({
          code: "FailedPreconditionError",
          message: `Cannot confirm booking from status ${current.status}`,
          details: {
            from: current.status,
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
