import type {
  BookingAuthorizationPolicy,
  BookingService,
} from "@motanos/booking";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { forbiddenFromBookingPolicy } from "./booking-auth";
import { normalizeOptionalReference, normalizeReference } from "./normalize";
import {
  toBookingOutput,
  type ExpireBookingHoldsInput,
  type ExpireBookingHoldsOutput,
} from "./types";

export interface ExpireBookingHoldsUseCaseDeps {
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  booking: BookingService;
}

export type ExpireBookingHoldsUseCase = UseCase<
  ExpireBookingHoldsInput,
  ExpireBookingHoldsOutput
>;

/**
 * ExpireBookingHolds — Policy then BookingService.expireHolds.
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

      const tenantReference = normalizeReference(input.tenantReference);
      const now = normalizeReference(input.now!);
      const bookingReferences = (input.bookingReferences ?? [])
        .map((ref) => normalizeOptionalReference(ref))
        .filter((ref): ref is string => ref !== undefined);

      const decision = await deps.bookingAuthorizationPolicy.decide({
        actorReference,
        tenantReference,
        operation: "expire",
        resourceType: "booking.holds",
        resourceReference: "holds",
        metadata: {
          ...(input.metadata ?? {}),
          now,
          ...(bookingReferences.length > 0
            ? { bookingReferences }
            : {}),
        },
      });

      if (!decision.allowed) {
        return forbiddenFromBookingPolicy(
          decision,
          "Booking hold expiration denied",
        );
      }

      const result = await deps.booking.expireHolds({
        tenantReference,
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
  if (!input.tenantReference?.trim()) {
    return {
      code: "ValidationError",
      message: "tenantReference is required",
    };
  }
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
