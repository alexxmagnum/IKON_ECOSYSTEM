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
});
