import type { BookingQueryService } from "@motanos/booking";
import {
  isDenied,
  type AuthorizationService,
} from "@motanos/permissions";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { READ_BOOKING_ACTION } from "./actions";
import { normalizeReference } from "./normalize";
import {
  toBookingOutput,
  type GetBookingInput,
  type GetBookingOutput,
} from "./types";

export interface GetBookingUseCaseDeps {
  authorization: AuthorizationService;
  bookingQuery: BookingQueryService;
}

export type GetBookingUseCase = UseCase<GetBookingInput, GetBookingOutput>;

/**
 * GetBooking — auth-first read by opaque reference (no existence oracle).
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

      const authorization = await deps.authorization.authorize({
        actor: actorReference,
        action: READ_BOOKING_ACTION,
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
          message: authorization.decision.reason ?? "Booking read denied",
          details: {
            decision: authorization.decision.decision,
            ...(authorization.decision.metadata !== undefined
              ? { decisionMetadata: authorization.decision.metadata }
              : {}),
          },
        });
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
