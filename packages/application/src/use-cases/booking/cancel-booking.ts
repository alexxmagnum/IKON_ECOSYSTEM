import type {
  BookingAuthorizationPolicy,
  BookingQueryService,
  BookingService,
} from "@motanos/booking-lifecycle";
import { canTransitionBooking } from "@motanos/booking-lifecycle";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { forbiddenFromBookingPolicy } from "./booking-auth";
import {
  toBookingOutput,
  type CancelBookingInput,
  type CancelBookingOutput,
} from "./types";

export interface CancelBookingUseCaseDeps {
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  booking: BookingService;
  bookingQuery: BookingQueryService;
}

export type CancelBookingUseCase = UseCase<
  CancelBookingInput,
  CancelBookingOutput
>;

/**
 * CancelBooking — Policy → domain transition check → BookingService.cancel.
 */
export function createCancelBookingUseCase(
  deps: CancelBookingUseCaseDeps,
): CancelBookingUseCase {
  return {
    name: "CancelBooking",
    async execute(input, context) {
      if (!input.tenantReference?.trim()) {
        return failure({
          code: "ValidationError",
          message: "tenantReference is required",
        });
      }

      if (!input.bookingReference?.trim()) {
        return failure({
          code: "ValidationError",
          message: "bookingReference is required",
        });
      }

      const tenantReference = input.tenantReference.trim();

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to cancel a booking",
        });
      }

      const current = await deps.bookingQuery.getBooking(
        tenantReference,
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
        tenantReference,
        operation: "cancel",
        resourceType: "booking",
        resourceReference: current.id,
        booking: {
          bookingReference: current.id,
          tenantReference: current.tenantReference,
          ownerUserId: current.ownerUserId,
          resourceId: current.resourceId,
          status: current.status,
        },
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (!decision.allowed) {
        return forbiddenFromBookingPolicy(decision, "Booking cancel denied");
      }

      if (
        !canTransitionBooking(
          current.status,
          "Cancelled",
          "booking.cancelled_by_user",
        )
      ) {
        return failure({
          code: "FailedPreconditionError",
          message: `Cannot cancel booking from status ${current.status}`,
          details: {
            from: current.status,
            to: "Cancelled",
            event: "booking.cancelled_by_user",
          },
        });
      }

      const result = await deps.booking.cancel({
        tenantReference,
        bookingId: input.bookingReference,
        ...(input.reason !== undefined ? { reason: input.reason } : {}),
      });

      return success(toBookingOutput(result.booking), {
        ...(result.events !== undefined ? { events: result.events } : {}),
      });
    },
  };
}
