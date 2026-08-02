import type {
  BookingResult,
  CancelBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
  ExpireBookingHoldsInput,
  ExpireBookingHoldsResult,
  RescheduleBookingInput,
  UpdateBookingInput,
} from "../contracts";
import type { Booking } from "../domain/booking";
import { createBookingTenantContext } from "../context/booking-tenant-context";
import {
  canRescheduleBooking,
  canTransitionBooking,
  DEFAULT_HOLD_TTL_MINUTES,
  shouldExpireBookingHold,
} from "../types/states";
import {
  emitBookingCancelled,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingHoldExpired,
  emitBookingRescheduled,
} from "../events/emit";
import type { BookingRepository } from "../repositories/booking-repository";
import { commitBookingMutation } from "./booking-mutation-boundary";
import type { BookingService } from "./index";

export interface CreateBookingServiceOptions {
  /** Opaque booking id factory (defaults to sequential booking-N). */
  generateId?: () => string;
  /** Clock for hold TTL (ISO). Defaults to Date.now(). */
  now?: () => Date;
}

/**
 * BookingService implementation over BookingRepository.
 * Owns the Booking Mutation Boundary: validate → mutate → persist → emit.
 * Tenant scope is required on every operation (DEC-BOOKING-TENANT-001).
 */
export function createBookingService(
  repository: BookingRepository,
  options: CreateBookingServiceOptions = {},
): BookingService {
  let sequence = 0;
  const generateId =
    options.generateId ??
    (() => {
      sequence += 1;
      return `booking-${sequence}`;
    });
  const now = options.now ?? (() => new Date());

  return {
    async create(input: CreateBookingInput): Promise<BookingResult> {
      const tenant = createBookingTenantContext(input.tenantReference);
      const holdExpiresAt = new Date(
        now().getTime() + DEFAULT_HOLD_TTL_MINUTES * 60_000,
      ).toISOString();
      const booking: Booking = {
        id: generateId(),
        tenantReference: tenant.tenantReference,
        resourceId: input.resourceId,
        ownerUserId: input.ownerUserId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "Draft",
        holdExpiresAt,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      };
      return commitBookingMutation(
        () => repository.create(tenant, booking),
        (stored) => emitBookingCreated(stored),
      );
    },

    async confirm(input: ConfirmBookingInput): Promise<BookingResult> {
      const tenant = createBookingTenantContext(input.tenantReference);
      const existing = await repository.getById(tenant, input.bookingId);
      if (!existing) {
        throw new Error(`Booking not found: ${input.bookingId}`);
      }
      if (
        !canTransitionBooking(
          existing.status,
          "Confirmed",
          "booking.confirmed_without_payment",
        )
      ) {
        throw new Error(
          `Invalid confirm transition from ${existing.status}`,
        );
      }
      const { holdExpiresAt: _hold, ...rest } = existing;
      const next: Booking = {
        ...rest,
        status: "Confirmed",
        ...(input.metadata !== undefined
          ? {
              metadata: {
                ...(existing.metadata ?? {}),
                ...input.metadata,
              },
            }
          : {}),
      };
      return commitBookingMutation(
        () => repository.update(tenant, next),
        (stored) => emitBookingConfirmed(stored),
      );
    },

    async update(input: UpdateBookingInput): Promise<BookingResult> {
      const tenant = createBookingTenantContext(input.tenantReference);
      const existing = await repository.getById(tenant, input.bookingId);
      if (!existing) {
        throw new Error(`Booking not found: ${input.bookingId}`);
      }
      const next: Booking = {
        ...existing,
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      };
      if (input.metadata?.__holdExpiresAt !== undefined) {
        const hold = input.metadata.__holdExpiresAt;
        if (typeof hold === "string") {
          next.holdExpiresAt = hold;
        }
      }
      const stored = await repository.update(tenant, next);
      return { booking: stored };
    },

    async reschedule(input: RescheduleBookingInput): Promise<BookingResult> {
      const tenant = createBookingTenantContext(input.tenantReference);
      const existing = await repository.getById(tenant, input.bookingId);
      if (!existing) {
        throw new Error(`NOT_FOUND:${input.bookingId}`);
      }
      if (!canRescheduleBooking(existing.status)) {
        throw new Error(
          `PRECONDITION:Cannot reschedule booking from status ${existing.status}`,
        );
      }
      const conflicts = await repository.findConflicts(tenant, {
        resourceId: existing.resourceId,
        range: { startsAt: input.startsAt, endsAt: input.endsAt },
        excludeBookingId: existing.id,
      });
      if (conflicts.length > 0) {
        throw new Error(`CONFLICT:overlap:${conflicts[0]?.id ?? "unknown"}`);
      }
      const previous = {
        startsAt: existing.startsAt,
        endsAt: existing.endsAt,
      };
      const next: Booking = {
        ...existing,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        ...(input.metadata !== undefined
          ? {
              metadata: {
                ...(existing.metadata ?? {}),
                ...input.metadata,
              },
            }
          : {}),
      };
      return commitBookingMutation(
        () => repository.update(tenant, next),
        (stored) => emitBookingRescheduled(stored, previous),
      );
    },

    async cancel(input: CancelBookingInput): Promise<BookingResult> {
      const tenant = createBookingTenantContext(input.tenantReference);
      const existing = await repository.getById(tenant, input.bookingId);
      if (!existing) {
        throw new Error(`Booking not found: ${input.bookingId}`);
      }
      if (
        !canTransitionBooking(
          existing.status,
          "Cancelled",
          "booking.cancelled_by_user",
        )
      ) {
        throw new Error(
          `Invalid cancel transition from ${existing.status}`,
        );
      }
      const next: Booking = { ...existing, status: "Cancelled" };
      return commitBookingMutation(
        () => repository.update(tenant, next),
        (stored) =>
          emitBookingCancelled(
            stored,
            now().toISOString(),
            input.reason !== undefined ? { reason: input.reason } : undefined,
          ),
      );
    },

    async expireHolds(
      input: ExpireBookingHoldsInput,
    ): Promise<ExpireBookingHoldsResult> {
      const tenant = createBookingTenantContext(input.tenantReference);
      const candidates =
        input.bookingIds !== undefined
          ? (
              await Promise.all(
                input.bookingIds.map((id) => repository.getById(tenant, id)),
              )
            ).filter((b): b is Booking => b !== null)
          : await repository.list(tenant, {});

      const expired: BookingResult[] = [];
      const expiredBookingIds: string[] = [];
      const events: ReturnType<typeof emitBookingHoldExpired>[] = [];

      for (const booking of candidates) {
        if (!shouldExpireBookingHold(booking, input.now)) {
          continue;
        }
        const { holdExpiresAt: _hold, ...rest } = booking;
        const next: Booking = { ...rest, status: "Expired" };
        const committed = await commitBookingMutation(
          () => repository.update(tenant, next),
          (stored) => emitBookingHoldExpired(stored, input.now),
        );
        expired.push({ booking: committed.booking });
        expiredBookingIds.push(committed.booking.id);
        events.push(...committed.events);
      }

      return {
        expired,
        expiredBookingIds,
        processedCount: candidates.length,
        ...(events.length > 0 ? { events } : {}),
      };
    },
  };
}
