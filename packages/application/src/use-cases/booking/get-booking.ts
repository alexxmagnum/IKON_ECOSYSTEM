import type { BookingAuthorizationPolicy, BookingQueryService } from "@motanos/booking";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { forbiddenFromBookingPolicy } from "./booking-auth";
import { normalizeReference } from "./normalize";
import {
  toBookingOutput,
  type GetBookingInput,
  type GetBookingOutput,
} from "./types";

export interface GetBookingUseCaseDeps {
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  bookingQuery: BookingQueryService;
}

export type GetBookingUseCase = UseCase<GetBookingInput, GetBookingOutput>;

/**
 * GetBooking — auth-first via BookingAuthorizationPolicy (no existence oracle).
 */
export function createGetBookingUseCase(
  deps: GetBookingUseCaseDeps,
): GetBookingUseCase {
  return {
    name: "GetBooking",
    async execute(input, context) {
      const bookingReference = input.bookingReference
        ? normalizeReference(input.bookingReference)
        : "";

      if (!bookingReference) {
        return failure({
          code: "ValidationError",
          message: "bookingReference is required",
        });
      }

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to read a booking",
        });
      }

      const actorReference = normalizeReference(context.actorReference);
      if (!actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to read a booking",
        });
      }

      const decision = await deps.bookingAuthorizationPolicy.decide({
        actorReference,
        operation: "read",
        resourceType: "booking",
        resourceReference: bookingReference,
        ...(input.metadata !== undefined
          ? { metadata: input.metadata }
          : {}),
      });

      if (!decision.allowed) {
        return forbiddenFromBookingPolicy(decision, "Booking read denied");
      }

      const current = await deps.bookingQuery.getBooking(bookingReference);
      if (!current) {
        return failure({
          code: "NotFoundError",
          message: "Booking not found",
          details: { bookingReference },
        });
      }

      return success(toBookingOutput(current));
    },
  };
}
