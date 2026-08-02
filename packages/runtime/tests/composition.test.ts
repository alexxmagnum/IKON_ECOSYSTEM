/**
 * Runtime composition tests — CreateBooking vertical slice wiring.
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
    assert.equal(composed.createBooking.name, "CreateBooking");
    assert.ok(composed.createBookingHandler);

    const { registry } = composed.runtime;
    assert.equal(registry.has(RUNTIME_SERVICE_TOKENS.authorization), true);
    assert.equal(registry.has(RUNTIME_SERVICE_TOKENS.booking), true);
    assert.equal(registry.has(RUNTIME_SERVICE_TOKENS.application), true);
    assert.equal(registry.has(RUNTIME_SERVICE_TOKENS.api), true);
    assert.equal(registry.has(RUNTIME_SERVICE_TOKENS.createBooking), true);
  });

  it("3. CreateBooking success — API → Application → Authorization → Booking", async () => {
    const { createBookingHandler, createBooking } = createMotanOSRuntime({
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
    assert.equal(response.data.resourceReference, "resource-1");

    const result = await createBooking.execute(
      {
        resourceReference: "resource-2",
        customerReference: "customer-2",
        startAt: "2026-08-02T12:00:00.000Z",
        endAt: "2026-08-02T13:00:00.000Z",
      },
      { actorReference: "actor-allowed" },
    );
    assert.equal(isSuccess(result), true);
  });

  it("4. Forbidden flow — ForbiddenError", async () => {
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
    assert.equal(result.error.details?.decision, "Denied");
  });
});
