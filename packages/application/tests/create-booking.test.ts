/**
 * CreateBooking vertical-slice contract tests.
 * In-memory stubs only — no external systems.
 *
 * Run: pnpm --filter @motanos/application test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  Booking,
  BookingService,
  CreateBookingInput as BookingEngineCreateInput,
} from "@motanos/booking";
import {
  canRescheduleBooking,
  canTransitionBooking,
  checkRangeAvailability,
  DEFAULT_HOLD_TTL_MINUTES,
  emitBookingCancelled,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingHoldExpired,
  emitBookingRescheduled,
  intervalsOverlap,
  shouldExpireBookingHold,
} from "@motanos/booking";
import {
  allow,
  authorizationResult,
  deny,
  type AuthorizationService,
} from "@motanos/permissions";
import {
  createCancelBookingUseCase,
  createCheckAvailabilityUseCase,
  createConfirmBookingUseCase,
  createCreateBookingUseCase,
  createExpireBookingHoldsUseCase,
  createGetBookingUseCase,
  createListBookingsUseCase,
  createRescheduleBookingUseCase,
  isFailure,
  isSuccess,
  type CreateBookingInput,
} from "../src/index.js";

function memoryBookingService(): BookingService {
  const store = new Map<string, Booking>();
  let seq = 0;

  return {
    async create(input: BookingEngineCreateInput) {
      seq += 1;
      const id = `booking-ref-${seq}`;
      const holdExpiresAt = new Date(
        Date.now() + DEFAULT_HOLD_TTL_MINUTES * 60_000,
      ).toISOString();
      const booking: Booking = {
        id,
        resourceId: input.resourceId,
        ownerUserId: input.ownerUserId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "Draft",
        holdExpiresAt,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      };
      store.set(id, booking);
      return {
        booking,
        events: [emitBookingCreated(booking)],
      };
    },
    async confirm(input) {
      const existing = store.get(input.bookingId);
      if (!existing) throw new Error("missing");
      if (
        !canTransitionBooking(
          existing.status,
          "Confirmed",
          "booking.confirmed_without_payment",
        )
      ) {
        throw new Error("invalid");
      }
      const { holdExpiresAt: _h, ...rest } = existing;
      const next: Booking = { ...rest, status: "Confirmed" };
      store.set(next.id, next);
      return {
        booking: next,
        events: [emitBookingConfirmed(next)],
      };
    },
    async update(input) {
      const existing = store.get(input.bookingId);
      if (!existing) throw new Error("missing");
      const next: Booking = {
        ...existing,
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
        ...((input as { holdExpiresAt?: string }).holdExpiresAt !== undefined
          ? {
              holdExpiresAt: (input as { holdExpiresAt?: string })
                .holdExpiresAt,
            }
          : {}),
      };
      // Allow tests to patch holdExpiresAt via metadata.__holdExpiresAt
      if (input.metadata?.__holdExpiresAt !== undefined) {
        const hold = input.metadata.__holdExpiresAt;
        if (typeof hold === "string") {
          next.holdExpiresAt = hold;
        }
      }
      store.set(next.id, next);
      return { booking: next };
    },
    async reschedule(input) {
      const existing = store.get(input.bookingId);
      if (!existing) throw new Error(`NOT_FOUND:${input.bookingId}`);
      if (!canRescheduleBooking(existing.status)) {
        throw new Error(
          `PRECONDITION:Cannot reschedule booking from status ${existing.status}`,
        );
      }
      const availability = checkRangeAvailability(
        existing.resourceId,
        { startsAt: input.startsAt, endsAt: input.endsAt },
        [...store.values()],
        { excludeBookingId: existing.id },
      );
      if (!availability.available) {
        throw new Error(`CONFLICT:${availability.reason ?? "overlap"}`);
      }
      const next: Booking = {
        ...existing,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      };
      store.set(next.id, next);
      return {
        booking: next,
        events: [
          emitBookingRescheduled(next, {
            startsAt: existing.startsAt,
            endsAt: existing.endsAt,
          }),
        ],
      };
    },
    async expireHolds(input) {
      const candidates =
        input.bookingIds !== undefined
          ? input.bookingIds
              .map((id) => store.get(id))
              .filter((b): b is Booking => b !== undefined)
          : [...store.values()];

      const expired: { booking: Booking }[] = [];
      const expiredBookingIds: string[] = [];
      const events: ReturnType<typeof emitBookingHoldExpired>[] = [];

      for (const booking of candidates) {
        if (!shouldExpireBookingHold(booking, input.now)) {
          continue;
        }
        const { holdExpiresAt: _hold, ...rest } = booking;
        const next: Booking = { ...rest, status: "Expired" };
        store.set(next.id, next);
        expired.push({ booking: next });
        expiredBookingIds.push(next.id);
        events.push(emitBookingHoldExpired(next, input.now));
      }

      return {
        expired,
        expiredBookingIds,
        processedCount: candidates.length,
        ...(events.length > 0 ? { events } : {}),
      };
    },
    async cancel(input) {
      const existing = store.get(input.bookingId);
      if (!existing) throw new Error("missing");
      if (
        !canTransitionBooking(
          existing.status,
          "Cancelled",
          "booking.cancelled_by_user",
        )
      ) {
        throw new Error("invalid");
      }
      const next: Booking = { ...existing, status: "Cancelled" };
      store.set(next.id, next);
      return {
        booking: next,
        events: [emitBookingCancelled(next)],
      };
    },
    async getById(id) {
      const booking = store.get(id);
      return booking ? { booking } : null;
    },
    async list(query) {
      return [...store.values()]
        .filter((booking) => {
          if (query.resourceId && booking.resourceId !== query.resourceId) {
            return false;
          }
          if (query.ownerUserId && booking.ownerUserId !== query.ownerUserId) {
            return false;
          }
          if (query.status) {
            const statuses = Array.isArray(query.status)
              ? query.status
              : [query.status];
            if (!statuses.includes(booking.status)) {
              return false;
            }
          }
          if (query.range && !intervalsOverlap(booking, query.range)) {
            return false;
          }
          return true;
        })
        .map((booking) => ({ booking }));
    },
    async checkAvailability(input) {
      const check = checkRangeAvailability(
        input.resourceId,
        { startsAt: input.startsAt, endsAt: input.endsAt },
        [...store.values()],
      );
      return {
        available: check.available,
        resourceId: input.resourceId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        ...(check.reason !== undefined ? { reason: check.reason } : {}),
      };
    },
  };
}

function allowAllAuthorization(): AuthorizationService {
  return {
    async check(context) {
      return authorizationResult(allow("allowed"), context);
    },
    async authorize(context) {
      return this.check(context);
    },
  };
}

function denyAllAuthorization(): AuthorizationService {
  return {
    async check(context) {
      return authorizationResult(deny("not permitted"), context);
    },
    async authorize(context) {
      return this.check(context);
    },
  };
}

const validInput: CreateBookingInput = {
  resourceReference: "resource-1",
  customerReference: "customer-1",
  startAt: "2026-08-02T10:00:00.000Z",
  endAt: "2026-08-02T11:00:00.000Z",
};

describe("CreateBooking vertical slice", () => {
  it("Case 1: valid CreateBooking returns success", async () => {
    const useCase = createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking: memoryBookingService(),
    });

    const result = await useCase.execute(validInput, {
      actorReference: "actor-1",
      requestReference: "req-1",
    });

    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;

    assert.ok(result.data.bookingReference);
    assert.equal(result.data.resourceReference, "resource-1");
    assert.equal(result.data.status, "Draft");
    assert.equal(result.events?.length, 1);
    assert.equal(result.events?.[0]?.eventType, "booking.created");
  });

  it("Case 2: invalid input returns ApplicationError ValidationError", async () => {
    const useCase = createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking: memoryBookingService(),
    });

    const result = await useCase.execute(
      {
        ...validInput,
        endAt: "2026-08-02T09:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ValidationError");
  });

  it("Case 3: authorization denied returns ForbiddenError", async () => {
    const useCase = createCreateBookingUseCase({
      authorization: denyAllAuthorization(),
      booking: memoryBookingService(),
    });

    const result = await useCase.execute(validInput, {
      actorReference: "actor-1",
    });

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
    assert.equal(result.error.details?.decision, "Denied");
  });
});

describe("ConfirmBooking / CancelBooking lifecycle", () => {
  it("Confirm success — Draft → Confirmed", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const create = createCreateBookingUseCase({ authorization: auth, booking });
    const confirm = createConfirmBookingUseCase({
      authorization: auth,
      booking,
    });

    const created = await create.execute(validInput, {
      actorReference: "actor-1",
    });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const confirmed = await confirm.execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(confirmed), true);
    if (!isSuccess(confirmed)) return;
    assert.equal(confirmed.data.status, "Confirmed");
    assert.equal(confirmed.events?.[0]?.eventType, "booking.confirmed");
  });

  it("Cancel success — Draft → Cancelled", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const create = createCreateBookingUseCase({ authorization: auth, booking });
    const cancel = createCancelBookingUseCase({ authorization: auth, booking });

    const created = await create.execute(validInput, {
      actorReference: "actor-1",
    });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const cancelled = await cancel.execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(cancelled), true);
    if (!isSuccess(cancelled)) return;
    assert.equal(cancelled.data.status, "Cancelled");
  });

  it("Forbidden confirm", async () => {
    const booking = memoryBookingService();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const result = await createConfirmBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });

  it("Forbidden cancel", async () => {
    const booking = memoryBookingService();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const result = await createCancelBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });
});

describe("CheckAvailability", () => {
  const range = {
    resourceReference: "resource-1",
    startAt: "2026-08-02T10:00:00.000Z",
    endAt: "2026-08-02T11:00:00.000Z",
  };

  it("available = true when no overlapping booking", async () => {
    const useCase = createCheckAvailabilityUseCase({
      authorization: allowAllAuthorization(),
      booking: memoryBookingService(),
    });

    const result = await useCase.execute(range, {
      actorReference: "actor-1",
    });
    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.available, true);
  });

  it("available = false when overlapping Draft exists", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    await createCreateBookingUseCase({ authorization: auth, booking }).execute(
      {
        resourceReference: "resource-1",
        customerReference: "customer-1",
        startAt: range.startAt,
        endAt: range.endAt,
      },
      { actorReference: "actor-1" },
    );

    const result = await createCheckAvailabilityUseCase({
      authorization: auth,
      booking,
    }).execute(range, { actorReference: "actor-1" });

    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.available, false);
    assert.ok(result.data.reason?.startsWith("overlap:"));
  });

  it("Forbidden availability", async () => {
    const result = await createCheckAvailabilityUseCase({
      authorization: denyAllAuthorization(),
      booking: memoryBookingService(),
    }).execute(range, { actorReference: "actor-denied" });

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });
});

describe("GetBooking / ListBookings", () => {
  it("Get booking success", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const created = await createCreateBookingUseCase({
      authorization: auth,
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const got = await createGetBookingUseCase({
      authorization: auth,
      booking,
    }).execute(
      { bookingReference: `  ${created.data.bookingReference}  ` },
      { actorReference: " actor-1 " },
    );
    assert.equal(isSuccess(got), true);
    if (!isSuccess(got)) return;
    assert.equal(got.data.bookingReference, created.data.bookingReference);
    assert.equal(got.data.status, "Draft");
  });

  it("Get booking not found after authorize", async () => {
    const result = await createGetBookingUseCase({
      authorization: allowAllAuthorization(),
      booking: memoryBookingService(),
    }).execute(
      { bookingReference: "missing-booking" },
      { actorReference: "actor-1" },
    );
    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "NotFoundError");
  });

  it("Forbidden read — denied before existence check", async () => {
    const booking = memoryBookingService();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const deniedExisting = await createGetBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(deniedExisting), true);
    if (!isFailure(deniedExisting)) return;
    assert.equal(deniedExisting.error.code, "ForbiddenError");

    const deniedMissing = await createGetBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
    }).execute(
      { bookingReference: "does-not-exist" },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(deniedMissing), true);
    if (!isFailure(deniedMissing)) return;
    assert.equal(deniedMissing.error.code, "ForbiddenError");
  });

  it("List bookings filters — resource, customer, status, range", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const create = createCreateBookingUseCase({ authorization: auth, booking });

    await create.execute(
      {
        ...validInput,
        customerReference: "actor-1",
        resourceReference: "resource-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    await create.execute(
      {
        ...validInput,
        customerReference: "actor-1",
        resourceReference: "resource-2",
        startAt: "2026-08-02T12:00:00.000Z",
        endAt: "2026-08-02T13:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    await create.execute(
      {
        ...validInput,
        customerReference: "other-customer",
        resourceReference: "resource-1",
        startAt: "2026-08-02T14:00:00.000Z",
        endAt: "2026-08-02T15:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );

    const list = createListBookingsUseCase({ authorization: auth, booking });

    const byResource = await list.execute(
      { resourceReference: "  resource-1  " },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(byResource), true);
    if (!isSuccess(byResource)) return;
    assert.equal(byResource.data.bookings.length, 1);
    assert.equal(byResource.data.bookings[0]?.resourceReference, "resource-1");

    const byCustomer = await list.execute(
      { customerReference: "other-customer" },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(byCustomer), true);
    if (!isSuccess(byCustomer)) return;
    assert.equal(byCustomer.data.bookings.length, 1);
    assert.equal(
      byCustomer.data.bookings[0]?.customerReference,
      "other-customer",
    );

    const byStatus = await list.execute(
      { status: "Draft" },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(byStatus), true);
    if (!isSuccess(byStatus)) return;
    assert.equal(byStatus.data.bookings.length, 2);

    const byRange = await list.execute(
      {
        startAt: "2026-08-02T11:30:00.000Z",
        endAt: "2026-08-02T12:30:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(byRange), true);
    if (!isSuccess(byRange)) return;
    assert.equal(byRange.data.bookings.length, 1);
    assert.equal(byRange.data.bookings[0]?.resourceReference, "resource-2");
  });

  it("List validation — startAt/endAt must be together", async () => {
    const list = createListBookingsUseCase({
      authorization: allowAllAuthorization(),
      booking: memoryBookingService(),
    });

    const startOnly = await list.execute(
      { startAt: "2026-08-02T10:00:00.000Z" },
      { actorReference: "actor-1" },
    );
    assert.equal(isFailure(startOnly), true);
    if (!isFailure(startOnly)) return;
    assert.equal(startOnly.error.code, "ValidationError");

    const endOnly = await list.execute(
      { endAt: "2026-08-02T11:00:00.000Z" },
      { actorReference: "actor-1" },
    );
    assert.equal(isFailure(endOnly), true);
    if (!isFailure(endOnly)) return;
    assert.equal(endOnly.error.code, "ValidationError");
  });

  it("Forbidden list", async () => {
    const result = await createListBookingsUseCase({
      authorization: denyAllAuthorization(),
      booking: memoryBookingService(),
    }).execute({}, { actorReference: "actor-denied" });

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });
});

describe("RescheduleBooking", () => {
  it("Reschedule success", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const created = await createCreateBookingUseCase({
      authorization: auth,
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const result = await createRescheduleBookingUseCase({
      authorization: auth,
      booking,
    }).execute(
      {
        bookingReference: created.data.bookingReference,
        newStartAt: "2026-08-02T14:00:00.000Z",
        newEndAt: "2026-08-02T15:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.startAt, "2026-08-02T14:00:00.000Z");
    assert.equal(result.data.endAt, "2026-08-02T15:00:00.000Z");
    assert.equal(result.data.status, "Draft");
  });

  it("Reschedule unavailable — ConflictError", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const create = createCreateBookingUseCase({ authorization: auth, booking });
    const first = await create.execute(validInput, {
      actorReference: "actor-1",
    });
    assert.equal(isSuccess(first), true);
    if (!isSuccess(first)) return;

    await create.execute(
      {
        ...validInput,
        startAt: "2026-08-02T12:00:00.000Z",
        endAt: "2026-08-02T13:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );

    const result = await createRescheduleBookingUseCase({
      authorization: auth,
      booking,
    }).execute(
      {
        bookingReference: first.data.bookingReference,
        newStartAt: "2026-08-02T12:00:00.000Z",
        newEndAt: "2026-08-02T13:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ConflictError");
  });

  it("Forbidden reschedule", async () => {
    const booking = memoryBookingService();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const result = await createRescheduleBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
    }).execute(
      {
        bookingReference: created.data.bookingReference,
        newStartAt: "2026-08-02T14:00:00.000Z",
        newEndAt: "2026-08-02T15:00:00.000Z",
      },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });

  it("Cancelled booking cannot reschedule", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const created = await createCreateBookingUseCase({
      authorization: auth,
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const cancelled = await createCancelBookingUseCase({
      authorization: auth,
      booking,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(cancelled), true);

    const result = await createRescheduleBookingUseCase({
      authorization: auth,
      booking,
    }).execute(
      {
        bookingReference: created.data.bookingReference,
        newStartAt: "2026-08-02T14:00:00.000Z",
        newEndAt: "2026-08-02T15:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "FailedPreconditionError");
  });
});

describe("ExpireBookingHolds", () => {
  it("Expire expired Draft booking", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const created = await createCreateBookingUseCase({
      authorization: auth,
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    await booking.update({
      bookingId: created.data.bookingReference,
      metadata: { __holdExpiresAt: "2020-01-01T00:00:00.000Z" },
    });

    const result = await createExpireBookingHoldsUseCase({
      authorization: auth,
      booking,
    }).execute(
      { now: "2026-08-02T12:00:00.000Z" },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.processedCount, 1);
    assert.equal(result.data.expiredBookingReferences.length, 1);
    assert.equal(result.data.bookings[0]?.status, "Expired");
  });

  it("Ignore active hold", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const created = await createCreateBookingUseCase({
      authorization: auth,
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    await booking.update({
      bookingId: created.data.bookingReference,
      metadata: { __holdExpiresAt: "2099-01-01T00:00:00.000Z" },
    });

    const result = await createExpireBookingHoldsUseCase({
      authorization: auth,
      booking,
    }).execute(
      { now: "2026-08-02T12:00:00.000Z" },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.expiredBookingReferences.length, 0);
    assert.equal(result.data.processedCount, 1);

    const still = await booking.getById(created.data.bookingReference);
    assert.equal(still?.booking.status, "Draft");
  });

  it("Ignore Confirmed booking", async () => {
    const booking = memoryBookingService();
    const auth = allowAllAuthorization();
    const created = await createCreateBookingUseCase({
      authorization: auth,
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const confirmed = await createConfirmBookingUseCase({
      authorization: auth,
      booking,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(confirmed), true);

    await booking.update({
      bookingId: created.data.bookingReference,
      metadata: { __holdExpiresAt: "2020-01-01T00:00:00.000Z" },
    });

    const result = await createExpireBookingHoldsUseCase({
      authorization: auth,
      booking,
    }).execute(
      { now: "2026-08-02T12:00:00.000Z" },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.expiredBookingReferences.length, 0);

    const still = await booking.getById(created.data.bookingReference);
    assert.equal(still?.booking.status, "Confirmed");
  });

  it("Forbidden expiration", async () => {
    const result = await createExpireBookingHoldsUseCase({
      authorization: denyAllAuthorization(),
      booking: memoryBookingService(),
    }).execute(
      { now: "2026-08-02T12:00:00.000Z" },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });
});
