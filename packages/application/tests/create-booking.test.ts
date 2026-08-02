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
  canTransitionBooking,
  DEFAULT_HOLD_TTL_MINUTES,
} from "@motanos/booking";
import {
  allow,
  authorizationResult,
  deny,
  type AuthorizationService,
} from "@motanos/permissions";
import {
  createCancelBookingUseCase,
  createConfirmBookingUseCase,
  createCreateBookingUseCase,
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
      return { booking };
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
      return { booking: next };
    },
    async update() {
      throw new Error("not used");
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
      return { booking: next };
    },
    async getById(id) {
      const booking = store.get(id);
      return booking ? { booking } : null;
    },
    async list() {
      return [];
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
