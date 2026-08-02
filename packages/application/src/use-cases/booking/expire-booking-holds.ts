import type { BookingService } from "@motanos/booking";
import {
  isDenied,
  type AuthorizationService,
} from "@motanos/permissions";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { EXPIRE_BOOKING_HOLDS_ACTION } from "./actions";
import { normalizeOptionalReference, normalizeReference } from "./normalize";
import {
  toBookingOutput,
  type ExpireBookingHoldsInput,
  type ExpireBookingHoldsOutput,
} from "./types";

export interface ExpireBookingHoldsUseCaseDeps {
  authorization: AuthorizationService;
  booking: BookingService;
}

export type ExpireBookingHoldsUseCase = UseCase<
  ExpireBookingHoldsInput,
  ExpireBookingHoldsOutput
>;

/**
 * ExpireBookingHolds — auth-first Draft hold TTL expiration (no cron).
 */
export function createExpireBookingHoldsUseCase(
  deps: ExpireBookingHoldsUseCaseDeps,
): ExpireBookingHoldsUseCase {
  return {
    name: "ExpireBookingHolds",
    async execute(input, context) {
      const validationError = validateExpireInput(input);
      if (validationError) {
        return failure(validationError);
      }

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to expire booking holds",
        });
      }

      const actorReference = normalizeReference(context.actorReference);
      if (!actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to expire booking holds",
        });
      }

      const now = normalizeReference(input.now!);
      const bookingReferences = (input.bookingReferences ?? [])
        .map((ref) => normalizeOptionalReference(ref))
        .filter((ref): ref is string => ref !== undefined);

      const authorization = await deps.authorization.authorize({
        actor: actorReference,
        action: EXPIRE_BOOKING_HOLDS_ACTION,
        resource: {
          resourceType: "booking.holds",
          resourceReference: "holds",
        },
        metadata: {
          ...(input.metadata ?? {}),
          now,
          ...(bookingReferences.length > 0
            ? { bookingReferences }
            : {}),
        },
      });

      if (isDenied(authorization.decision)) {
        return failure({
          code: "ForbiddenError",
          message:
            authorization.decision.reason ?? "Booking hold expiration denied",
          details: {
            decision: authorization.decision.decision,
            ...(authorization.decision.metadata !== undefined
              ? { decisionMetadata: authorization.decision.metadata }
              : {}),
          },
        });
      }

      const result = await deps.booking.expireHolds({
        now,
        ...(bookingReferences.length > 0
          ? { bookingIds: bookingReferences }
          : {}),
      });

      return success(
        {
          bookings: result.expired.map((item) =>
            toBookingOutput(item.booking),
          ),
          expiredBookingReferences: result.expiredBookingIds,
          processedCount: result.processedCount,
        },
        {
          ...(result.events !== undefined ? { events: result.events } : {}),
        },
      );
    },
  };
}

function validateExpireInput(input: ExpireBookingHoldsInput): {
  code: "ValidationError";
  message: string;
  details?: Record<string, unknown>;
} | null {
  if (!input.now?.trim()) {
    return {
      code: "ValidationError",
      message: "now is required",
    };
  }
  if (Number.isNaN(Date.parse(input.now.trim()))) {
    return {
      code: "ValidationError",
      message: "now must be a valid ISO-8601 timestamp",
      details: { now: input.now },
    };
  }
  return null;
}
