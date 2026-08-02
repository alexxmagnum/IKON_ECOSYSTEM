/**
 * Runtime composition tests — Booking lifecycle wiring.
 * Run: pnpm --filter @motanos/runtime test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isApiSuccess } from "@motanos/api";
import { isFailure, isSuccess } from "@motanos/application";
import {
  createMotanOSRuntime,
  RUNTIME_SERVICE_TOKENS,
} from "../src/index.js";

describe("@motanos/runtime composition", () => {
  it("1. Runtime boot — runtime created", () => {
    const composed = createMotanOSRuntime({
      config: { environment: "test" },
    });

    assert.ok(composed.runtime);
    assert.equal(composed.runtime.config.environment, "test");
    assert.ok(composed.runtime.registry);
  });

  it("2. Services availability — Authorization, Booking, Application, API", () => {
    const composed = createMotanOSRuntime({
      config: { environment: "test" },
    });

    assert.ok(composed.authorization);
    assert.ok(composed.booking);
    assert.ok(composed.application);
    assert.ok(composed.api);
    assert.ok(composed.createBooking);
    assert.ok(composed.confirmBooking);
    assert.ok(composed.cancelBooking);

    const { registry } = composed.runtime;
    assert.equal(registry.has(RUNTIME_SERVICE_TOKENS.confirmBooking), true);
    assert.equal(registry.has(RUNTIME_SERVICE_TOKENS.cancelBooking), true);
  });

  it("3. CreateBooking success — API → Application → Authorization → Booking", async () => {
    const { createBookingHandler } = createMotanOSRuntime({
      config: { environment: "test" },
    });

    const response = await createBookingHandler.handle(
      {
        requestReference: "req-1",
        resourceReference: "resource-1",
        customerReference: "customer-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      {
        actorReference: "actor-allowed",
        requestReference: "req-1",
      },
    );

    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.status, "Draft");
  });

  it("4. Forbidden create — ForbiddenError", async () => {
    const { createBooking } = createMotanOSRuntime({
      config: { environment: "test" },
      deniedActors: ["actor-denied"],
    });

    const result = await createBooking.execute(
      {
        resourceReference: "resource-1",
        customerReference: "customer-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-denied" },
    );

    assert.equal(isFailure(result), true);
    if (!isFailure(result)) return;
    assert.equal(result.error.code, "ForbiddenError");
  });

  it("5. Confirm success via composed handlers", async () => {
    const { createBookingHandler, confirmBookingHandler } =
      createMotanOSRuntime({ config: { environment: "test" } });

    const created = await createBookingHandler.handle(
      {
        resourceReference: "resource-1",
        customerReference: "customer-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(created), true);
    if (!isApiSuccess(created)) return;

    const confirmed = await confirmBookingHandler.handle(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(confirmed), true);
    if (!isApiSuccess(confirmed)) return;
    assert.equal(confirmed.data.status, "Confirmed");
  });

  it("6. Cancel success via composed handlers", async () => {
    const { createBookingHandler, cancelBookingHandler } = createMotanOSRuntime(
      { config: { environment: "test" } },
    );

    const created = await createBookingHandler.handle(
      {
        resourceReference: "resource-1",
        customerReference: "customer-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(created), true);
    if (!isApiSuccess(created)) return;

    const cancelled = await cancelBookingHandler.handle(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(cancelled), true);
    if (!isApiSuccess(cancelled)) return;
    assert.equal(cancelled.data.status, "Cancelled");
  });

  it("7. Forbidden confirm / cancel", async () => {
    const allowed = createMotanOSRuntime({ config: { environment: "test" } });
    const created = await allowed.createBooking.execute(
      {
        resourceReference: "resource-1",
        customerReference: "customer-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isSuccess(created), true);
    if (!isSuccess(created)) return;

    const denied = createMotanOSRuntime({
      config: { environment: "test" },
      booking: allowed.booking,
      deniedActors: ["actor-denied"],
    });

    const confirmDenied = await denied.confirmBooking.execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(confirmDenied), true);
    if (!isFailure(confirmDenied)) return;
    assert.equal(confirmDenied.error.code, "ForbiddenError");

    const cancelDenied = await denied.cancelBooking.execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(cancelDenied), true);
    if (!isFailure(cancelDenied)) return;
    assert.equal(cancelDenied.error.code, "ForbiddenError");
  });

  it("8. Availability available / unavailable / forbidden", async () => {
    const composed = createMotanOSRuntime({
      config: { environment: "test" },
    });

    const free = await composed.checkAvailabilityHandler.handle(
      {
        resourceReference: "resource-avail",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(free), true);
    if (!isApiSuccess(free)) return;
    assert.equal(free.data.available, true);

    await composed.createBookingHandler.handle(
      {
        resourceReference: "resource-avail",
        customerReference: "customer-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );

    const blocked = await composed.checkAvailabilityHandler.handle(
      {
        resourceReference: "resource-avail",
        startAt: "2026-08-02T10:30:00.000Z",
        endAt: "2026-08-02T11:30:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(blocked), true);
    if (!isApiSuccess(blocked)) return;
    assert.equal(blocked.data.available, false);

    const deniedRuntime = createMotanOSRuntime({
      config: { environment: "test" },
      booking: composed.booking,
      deniedActors: ["actor-denied"],
    });
    const forbidden = await deniedRuntime.checkAvailability.execute(
      {
        resourceReference: "resource-avail",
        startAt: "2026-08-02T14:00:00.000Z",
        endAt: "2026-08-02T15:00:00.000Z",
      },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(forbidden), true);
    if (!isFailure(forbidden)) return;
    assert.equal(forbidden.error.code, "ForbiddenError");
  });

  it("9. Get / List booking success, not found, forbidden, filters", async () => {
    const composed = createMotanOSRuntime({
      config: { environment: "test" },
    });

    const created = await composed.createBookingHandler.handle(
      {
        resourceReference: "resource-query",
        customerReference: "actor-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(created), true);
    if (!isApiSuccess(created)) return;

    await composed.createBookingHandler.handle(
      {
        resourceReference: "resource-other",
        customerReference: "actor-1",
        startAt: "2026-08-02T12:00:00.000Z",
        endAt: "2026-08-02T13:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );

    const got = await composed.getBookingHandler.handle(
      { bookingReference: `  ${created.data.bookingReference}  ` },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(got), true);
    if (!isApiSuccess(got)) return;
    assert.equal(got.data.bookingReference, created.data.bookingReference);

    const missing = await composed.getBooking.execute(
      { bookingReference: "does-not-exist" },
      { actorReference: "actor-1" },
    );
    assert.equal(isFailure(missing), true);
    if (!isFailure(missing)) return;
    assert.equal(missing.error.code, "NotFoundError");

    const listed = await composed.listBookingsHandler.handle(
      { resourceReference: "  resource-query  " },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(listed), true);
    if (!isApiSuccess(listed)) return;
    assert.equal(listed.data.bookings.length, 1);
    assert.equal(listed.data.bookings[0]?.resourceReference, "resource-query");

    const byStatus = await composed.listBookingsHandler.handle(
      { status: "Draft" },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(byStatus), true);
    if (!isApiSuccess(byStatus)) return;
    assert.equal(byStatus.data.bookings.length, 2);

    const byRange = await composed.listBookingsHandler.handle(
      {
        startAt: "2026-08-02T11:30:00.000Z",
        endAt: "2026-08-02T12:30:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(byRange), true);
    if (!isApiSuccess(byRange)) return;
    assert.equal(byRange.data.bookings.length, 1);

    const denied = createMotanOSRuntime({
      config: { environment: "test" },
      booking: composed.booking,
      deniedActors: ["actor-denied"],
    });
    const forbiddenRead = await denied.getBooking.execute(
      { bookingReference: created.data.bookingReference },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(forbiddenRead), true);
    if (!isFailure(forbiddenRead)) return;
    assert.equal(forbiddenRead.error.code, "ForbiddenError");

    const forbiddenMissing = await denied.getBooking.execute(
      { bookingReference: "missing-id" },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(forbiddenMissing), true);
    if (!isFailure(forbiddenMissing)) return;
    assert.equal(forbiddenMissing.error.code, "ForbiddenError");

    const forbiddenList = await denied.listBookings.execute(
      {},
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(forbiddenList), true);
    if (!isFailure(forbiddenList)) return;
    assert.equal(forbiddenList.error.code, "ForbiddenError");
  });

  it("10. Reschedule success and forbidden", async () => {
    const composed = createMotanOSRuntime({
      config: { environment: "test" },
    });

    assert.ok(composed.rescheduleBookingHandler);
    assert.equal(
      composed.runtime.registry.has(RUNTIME_SERVICE_TOKENS.rescheduleBookingHandler),
      true,
    );

    const created = await composed.createBookingHandler.handle(
      {
        resourceReference: "resource-reschedule",
        customerReference: "actor-1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(created), true);
    if (!isApiSuccess(created)) return;

    const rescheduled = await composed.rescheduleBookingHandler.handle(
      {
        bookingReference: created.data.bookingReference,
        newStartAt: "2026-08-02T16:00:00.000Z",
        newEndAt: "2026-08-02T17:00:00.000Z",
      },
      { actorReference: "actor-1" },
    );
    assert.equal(isApiSuccess(rescheduled), true);
    if (!isApiSuccess(rescheduled)) return;
    assert.equal(rescheduled.data.startAt, "2026-08-02T16:00:00.000Z");
    assert.equal(rescheduled.data.status, "Draft");

    const denied = createMotanOSRuntime({
      config: { environment: "test" },
      booking: composed.booking,
      deniedActors: ["actor-denied"],
    });
    const forbidden = await denied.rescheduleBooking.execute(
      {
        bookingReference: created.data.bookingReference,
        newStartAt: "2026-08-02T18:00:00.000Z",
        newEndAt: "2026-08-02T19:00:00.000Z",
      },
      { actorReference: "actor-denied" },
    );
    assert.equal(isFailure(forbidden), true);
    if (!isFailure(forbidden)) return;
    assert.equal(forbidden.error.code, "ForbiddenError");
  });
});
