import type {
  BookingAuthorizationPolicy,
  BookingQueryService,
  ListBookingsQuery,
} from "@motanos/booking-lifecycle";
import type { UseCase } from "../../contracts/use-case";
import { failure, success } from "../../contracts/result";
import { forbiddenFromBookingPolicy } from "./booking-auth";
import {
  normalizeOptionalReference,
  normalizeOptionalTimestamp,
  normalizeReference,
} from "./normalize";
import {
  toBookingOutput,
  type ListBookingsInput,
  type ListBookingsOutput,
} from "./types";

export interface ListBookingsUseCaseDeps {
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  bookingQuery: BookingQueryService;
}

export type ListBookingsUseCase = UseCase<
  ListBookingsInput,
  ListBookingsOutput
>;

/**
 * ListBookings — Policy then BookingQueryService.
 * See DEC-BOOKING-QUERY-001 for customer scope defaults.
 */
export function createListBookingsUseCase(
  deps: ListBookingsUseCaseDeps,
): ListBookingsUseCase {
  return {
    name: "ListBookings",
    async execute(input, context) {
      if (!input.tenantReference?.trim()) {
        return failure({
          code: "ValidationError",
          message: "tenantReference is required",
        });
      }

      if (!context.actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to list bookings",
        });
      }

      const actorReference = normalizeReference(context.actorReference);
      if (!actorReference) {
        return failure({
          code: "UnauthorizedError",
          message: "actorReference is required to list bookings",
        });
      }

      const tenantReference = normalizeReference(input.tenantReference);
      const normalized = normalizeListBookingsInput(input, actorReference);
      const validationError = validateNormalizedListInput(normalized);
      if (validationError) {
        return failure(validationError);
      }

      const decision = await deps.bookingAuthorizationPolicy.decide({
        actorReference,
        tenantReference,
        operation: "list",
        resourceType: "booking.list",
        resourceReference:
          normalized.resourceReference ??
          normalized.customerReference ??
          "bookings",
        metadata: {
          ...(input.metadata ?? {}),
          filters: {
            ...(normalized.resourceReference !== undefined
              ? { resourceReference: normalized.resourceReference }
              : {}),
            ...(normalized.customerReference !== undefined
              ? { customerReference: normalized.customerReference }
              : {}),
            ...(normalized.startAt !== undefined
              ? { startAt: normalized.startAt }
              : {}),
            ...(normalized.endAt !== undefined
              ? { endAt: normalized.endAt }
              : {}),
            ...(normalized.status !== undefined
              ? { status: normalized.status }
              : {}),
            customerScopeDefaulted: normalized.customerScopeDefaulted,
          },
        },
      });

      if (!decision.allowed) {
        return forbiddenFromBookingPolicy(decision, "Booking list denied");
      }

      const query = toListBookingsQuery(normalized);
      const results = await deps.bookingQuery.listBookings(
        tenantReference,
        query,
      );

      return success({
        bookings: results.map((item) => toBookingOutput(item)),
      });
    },
  };
}

interface NormalizedListBookingsInput {
  resourceReference?: string;
  customerReference: string;
  startAt?: string;
  endAt?: string;
  status?: ListBookingsInput["status"];
  customerScopeDefaulted: boolean;
}

function normalizeListBookingsInput(
  input: ListBookingsInput,
  actorReference: string,
): NormalizedListBookingsInput {
  const resourceReference = normalizeOptionalReference(
    input.resourceReference,
  );
  const explicitCustomer = normalizeOptionalReference(input.customerReference);
  const startAt = normalizeOptionalTimestamp(input.startAt);
  const endAt = normalizeOptionalTimestamp(input.endAt);

  return {
    ...(resourceReference !== undefined ? { resourceReference } : {}),
    customerReference: explicitCustomer ?? actorReference,
    customerScopeDefaulted: explicitCustomer === undefined,
    ...(startAt !== undefined ? { startAt } : {}),
    ...(endAt !== undefined ? { endAt } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
}

function validateNormalizedListInput(
  input: NormalizedListBookingsInput,
): {
  code: "ValidationError";
  message: string;
  details?: Record<string, unknown>;
} | null {
  const hasStart = Boolean(input.startAt);
  const hasEnd = Boolean(input.endAt);
  if (hasStart !== hasEnd) {
    return {
      code: "ValidationError",
      message: "startAt and endAt must be provided together",
    };
  }
  if (hasStart && hasEnd) {
    const start = Date.parse(input.startAt!);
    const end = Date.parse(input.endAt!);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return {
        code: "ValidationError",
        message: "startAt and endAt must be valid ISO-8601 timestamps",
      };
    }
    if (end <= start) {
      return {
        code: "ValidationError",
        message: "endAt must be after startAt",
        details: { startAt: input.startAt, endAt: input.endAt },
      };
    }
  }
  return null;
}

function toListBookingsQuery(
  input: NormalizedListBookingsInput,
): ListBookingsQuery {
  return {
    ...(input.resourceReference !== undefined
      ? { resourceId: input.resourceReference }
      : {}),
    ownerUserId: input.customerReference,
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.startAt !== undefined && input.endAt !== undefined
      ? {
          range: {
            startsAt: input.startAt,
            endsAt: input.endAt,
          },
        }
      : {}),
  };
}
