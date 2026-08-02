/**
 * CreateBooking vertical-slice contract tests.
 * In-memory stubs only — no external systems.
 *
 * Run: pnpm --filter @motanos/application test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BookingService, BookingQueryService } from "@motanos/booking";
import {
  createBookingQueryService,
  createBookingService,
  createInMemoryBookingRepository,
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

function memoryBookingStack(): {
  booking: BookingService;
  bookingQuery: BookingQueryService;
} {
  const repository = createInMemoryBookingRepository();
  return {
    booking: createBookingService(repository),
    bookingQuery: createBookingQueryService(repository),
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
      booking: memoryBookingStack().booking,
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
      booking: memoryBookingStack().booking,
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
      booking: memoryBookingStack().booking,
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
    const { booking, bookingQuery } = memoryBookingStack();
    const auth = allowAllAuthorization();
    const create = createCreateBookingUseCase({ authorization: auth, booking });
    const confirm = createConfirmBookingUseCase({
      authorization: auth,
      booking,
      bookingQuery,
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
    const { booking, bookingQuery } = memoryBookingStack();
    const auth = allowAllAuthorization();
    const create = createCreateBookingUseCase({ authorization: auth, booking });
    const cancel = createCancelBookingUseCase({
      authorization: auth,
      booking,
      bookingQuery,
    });

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
    const { booking, bookingQuery } = memoryBookingStack();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const result = await createConfirmBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
      bookingQuery,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });

  it("Forbidden cancel", async () => {
    const { booking, bookingQuery } = memoryBookingStack();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const result = await createCancelBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
      bookingQuery,
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
      bookingQuery: memoryBookingStack().bookingQuery,
    });

    const result = await useCase.execute(range, {
      actorReference: "actor-1",
    });
    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.available, true);
  });

  it("available = false when overlapping Draft exists", async () => {
    const { booking, bookingQuery } = memoryBookingStack();
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
      bookingQuery,
    }).execute(range, { actorReference: "actor-1" });

    assert.equal(isSuccess(result), true);
    if (!isSuccess(result)) return;
    assert.equal(result.data.available, false);
    assert.ok(result.data.reason?.startsWith("overlap:"));
  });

  it("Forbidden availability", async () => {
    const result = await createCheckAvailabilityUseCase({
      authorization: denyAllAuthorization(),
      bookingQuery: memoryBookingStack().bookingQuery,
    }).execute(range, { actorReference: "actor-denied" });

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });
});

describe("GetBooking / ListBookings", () => {
  it("Get booking success", async () => {
    const { booking, bookingQuery } = memoryBookingStack();
    const auth = allowAllAuthorization();
    const created = await createCreateBookingUseCase({
      authorization: auth,
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const got = await createGetBookingUseCase({
      authorization: auth,
      bookingQuery,
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
      bookingQuery: memoryBookingStack().bookingQuery,
    }).execute(
      { bookingReference: "missing-booking" },
      { actorReference: "actor-1" },
    );
    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "NotFoundError");
  });

  it("Forbidden read — denied before existence check", async () => {
    const { booking, bookingQuery } = memoryBookingStack();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const deniedExisting = await createGetBookingUseCase({
      authorization: denyAllAuthorization(),
      bookingQuery,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(deniedExisting), true);
    if (!isFailure(deniedExisting)) return;
    assert.equal(deniedExisting.error.code, "ForbiddenError");

    const deniedMissing = await createGetBookingUseCase({
      authorization: denyAllAuthorization(),
      bookingQuery,
    }).execute(
      { bookingReference: "does-not-exist" },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(deniedMissing), true);
    if (!isFailure(deniedMissing)) return;
    assert.equal(deniedMissing.error.code, "ForbiddenError");
  });

  it("List bookings filters — resource, customer, status, range", async () => {
    const { booking, bookingQuery } = memoryBookingStack();
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

    const list = createListBookingsUseCase({ authorization: auth, bookingQuery });

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
      bookingQuery: memoryBookingStack().bookingQuery,
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
      bookingQuery: memoryBookingStack().bookingQuery,
    }).execute({}, { actorReference: "actor-denied" });

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });
});

describe("RescheduleBooking", () => {
  it("Reschedule success", async () => {
    const { booking, bookingQuery } = memoryBookingStack();
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
      bookingQuery,
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
    const { booking, bookingQuery } = memoryBookingStack();
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
      bookingQuery,
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
    const { booking, bookingQuery } = memoryBookingStack();
    const created = await createCreateBookingUseCase({
      authorization: allowAllAuthorization(),
      booking,
    }).execute(validInput, { actorReference: "actor-1" });
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const result = await createRescheduleBookingUseCase({
      authorization: denyAllAuthorization(),
      booking,
      bookingQuery,
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
    const { booking, bookingQuery } = memoryBookingStack();
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
      bookingQuery,
    }).execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(cancelled), true);

    const result = await createRescheduleBookingUseCase({
      authorization: auth,
      booking,
      bookingQuery,
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
    const { booking } = memoryBookingStack();
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
    const { booking, bookingQuery } = memoryBookingStack();
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

    const still = await bookingQuery.getBooking(created.data.bookingReference);
    assert.equal(still?.status, "Draft");
  });

  it("Ignore Confirmed booking", async () => {
    const { booking, bookingQuery } = memoryBookingStack();
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
      bookingQuery,
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

    const still = await bookingQuery.getBooking(created.data.bookingReference);
    assert.equal(still?.status, "Confirmed");
  });

  it("Forbidden expiration", async () => {
    const result = await createExpireBookingHoldsUseCase({
      authorization: denyAllAuthorization(),
      booking: memoryBookingStack().booking,
    }).execute(
      { now: "2026-08-02T12:00:00.000Z" },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });
});
