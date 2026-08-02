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
import { DEFAULT_HOLD_TTL_MINUTES } from "@motanos/booking";
import {
  allow,
  authorizationResult,
  deny,
  type AuthorizationService,
} from "@motanos/permissions";
import {
  createCreateBookingUseCase,
  isFailure,
  isSuccess,
  type CreateBookingInput,
} from "../src/index.js";

function memoryBookingService(): BookingService {
  return {
    async create(input: BookingEngineCreateInput) {
      const holdExpiresAt = new Date(
        Date.now() + DEFAULT_HOLD_TTL_MINUTES * 60_000,
      ).toISOString();
      const booking: Booking = {
        id: "booking-ref-1",
        resourceId: input.resourceId,
        ownerUserId: input.ownerUserId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "Draft",
        holdExpiresAt,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      };
      return { booking };
    },
    async update() {
      throw new Error("not used");
    },
    async cancel() {
      throw new Error("not used");
    },
    async getById() {
      return null;
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

    assert.equal(result.data.bookingReference, "booking-ref-1");
    assert.equal(result.data.resourceReference, "resource-1");
    assert.equal(result.data.customerReference, "customer-1");
    assert.equal(result.data.status, "Draft");
    assert.ok(result.data.holdExpiresAt);
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
