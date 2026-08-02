/**
 * API booking lifecycle mapping contract tests.
 * Run: pnpm --filter @motanos/api test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failure, success } from "@motanos/application";
import {
  isApiFailure,
  isApiSuccess,
  toCancelBookingInput,
  toCancelBookingResponse,
  toCheckAvailabilityInput,
  toCheckAvailabilityResponse,
  toConfirmBookingInput,
  toConfirmBookingResponse,
  toCreateBookingInput,
  toCreateBookingResponse,
  toGetBookingInput,
  toGetBookingResponse,
  toListBookingsInput,
  toListBookingsResponse,
  toRescheduleBookingInput,
  toRescheduleBookingResponse,
  toExpireBookingHoldsInput,
  toExpireBookingHoldsResponse,
  type CancelBookingRequest,
  type CheckAvailabilityRequest,
  type ConfirmBookingRequest,
  type CreateBookingRequest,
  type ExpireBookingHoldsRequest,
  type GetBookingRequest,
  type ListBookingsRequest,
  type RescheduleBookingRequest,
} from "../src/index.js";

describe("CreateBooking API contracts", () => {
  it("maps CreateBookingRequest to Application input", () => {
    const request: CreateBookingRequest = {
      requestReference: "req-api-1",
      resourceReference: "resource-1",
      customerReference: "customer-1",
      startAt: "2026-08-02T10:00:00.000Z",
      endAt: "2026-08-02T11:00:00.000Z",
      metadata: { source: "test" },
    };

    const input = toCreateBookingInput(request);
    assert.equal(input.resourceReference, "resource-1");
    assert.equal(input.customerReference, "customer-1");
    assert.equal(input.metadata?.source, "test");
  });

  it("maps Application success to ApiResponse data envelope", () => {
    const response = toCreateBookingResponse(
      success({
        bookingReference: "b1",
        resourceReference: "r1",
        customerReference: "c1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
        status: "Draft",
      }),
      { requestReference: "req-1", version: "v1" },
    );

    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.bookingReference, "b1");
    assert.equal(response.metadata?.requestReference, "req-1");
  });

  it("maps Application failure to ApiResponse error envelope", () => {
    const response = toCreateBookingResponse(
      failure({
        code: "ForbiddenError",
        message: "denied",
      }),
    );

    assert.equal(isApiFailure(response), true);
    if (!isApiFailure(response)) return;
    assert.equal(response.error.code, "ForbiddenError");
  });
});

describe("Confirm / Cancel API contracts", () => {
  it("maps ConfirmBookingRequest and success response", () => {
    const request: ConfirmBookingRequest = {
      bookingReference: "b1",
    };
    assert.equal(toConfirmBookingInput(request).bookingReference, "b1");

    const response = toConfirmBookingResponse(
      success({
        bookingReference: "b1",
        resourceReference: "r1",
        customerReference: "c1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
        status: "Confirmed",
      }),
    );
    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.status, "Confirmed");
  });

  it("maps CancelBookingRequest and success response", () => {
    const request: CancelBookingRequest = {
      bookingReference: "b1",
      reason: "changed plans",
    };
    const input = toCancelBookingInput(request);
    assert.equal(input.bookingReference, "b1");
    assert.equal(input.reason, "changed plans");

    const response = toCancelBookingResponse(
      success({
        bookingReference: "b1",
        resourceReference: "r1",
        customerReference: "c1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
        status: "Cancelled",
      }),
    );
    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.status, "Cancelled");
  });
});

describe("CheckAvailability API contracts", () => {
  it("maps request and available response", () => {
    const request: CheckAvailabilityRequest = {
      resourceReference: "r1",
      startAt: "2026-08-02T10:00:00.000Z",
      endAt: "2026-08-02T11:00:00.000Z",
    };
    const input = toCheckAvailabilityInput(request);
    assert.equal(input.resourceReference, "r1");

    const response = toCheckAvailabilityResponse(
      success({
        available: true,
        resourceReference: "r1",
        startAt: request.startAt,
        endAt: request.endAt,
      }),
    );
    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.available, true);
  });
});

describe("Get / List booking API contracts", () => {
  it("maps GetBookingRequest and success response", () => {
    const request: GetBookingRequest = {
      bookingReference: "  b1  ",
    };
    assert.equal(toGetBookingInput(request).bookingReference, "b1");

    const response = toGetBookingResponse(
      success({
        bookingReference: "b1",
        resourceReference: "r1",
        customerReference: "c1",
        startAt: "2026-08-02T10:00:00.000Z",
        endAt: "2026-08-02T11:00:00.000Z",
        status: "Draft",
      }),
    );
    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.bookingReference, "b1");
    assert.equal(response.error, undefined);
  });

  it("maps GetBooking failure to error envelope", () => {
    const response = toGetBookingResponse(
      failure({
        code: "NotFoundError",
        message: "Booking not found",
      }),
    );
    assert.equal(isApiFailure(response), true);
    if (!isApiFailure(response)) return;
    assert.equal(response.error.code, "NotFoundError");
    assert.equal(response.data, undefined);
  });

  it("maps ListBookingsRequest and list response", () => {
    const request: ListBookingsRequest = {
      resourceReference: "  r1  ",
      customerReference: "  c1  ",
      status: "Draft",
    };
    const input = toListBookingsInput(request);
    assert.equal(input.resourceReference, "r1");
    assert.equal(input.customerReference, "c1");
    assert.equal(input.status, "Draft");

    const response = toListBookingsResponse(
      success({
        bookings: [
          {
            bookingReference: "b1",
            resourceReference: "r1",
            customerReference: "c1",
            startAt: "2026-08-02T10:00:00.000Z",
            endAt: "2026-08-02T11:00:00.000Z",
            status: "Draft",
          },
        ],
      }),
    );
    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.bookings.length, 1);
    assert.equal(response.error, undefined);
  });

  it("maps ListBookings failure to error envelope", () => {
    const response = toListBookingsResponse(
      failure({
        code: "ForbiddenError",
        message: "Booking list denied",
      }),
    );
    assert.equal(isApiFailure(response), true);
    if (!isApiFailure(response)) return;
    assert.equal(response.error.code, "ForbiddenError");
    assert.equal(response.data, undefined);
  });
});

describe("RescheduleBooking API contracts", () => {
  it("maps RescheduleBookingRequest and success response", () => {
    const request: RescheduleBookingRequest = {
      bookingReference: "  b1  ",
      newStartAt: "  2026-08-02T14:00:00.000Z  ",
      newEndAt: "2026-08-02T15:00:00.000Z",
    };
    const input = toRescheduleBookingInput(request);
    assert.equal(input.bookingReference, "b1");
    assert.equal(input.newStartAt, "2026-08-02T14:00:00.000Z");
    assert.equal(input.newEndAt, "2026-08-02T15:00:00.000Z");

    const response = toRescheduleBookingResponse(
      success({
        bookingReference: "b1",
        resourceReference: "r1",
        customerReference: "c1",
        startAt: "2026-08-02T14:00:00.000Z",
        endAt: "2026-08-02T15:00:00.000Z",
        status: "Draft",
      }),
    );
    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.startAt, "2026-08-02T14:00:00.000Z");
    assert.equal(response.error, undefined);
  });

  it("maps RescheduleBooking failure to error envelope", () => {
    const response = toRescheduleBookingResponse(
      failure({
        code: "ConflictError",
        message: "New booking window conflicts with existing availability",
      }),
    );
    assert.equal(isApiFailure(response), true);
    if (!isApiFailure(response)) return;
    assert.equal(response.error.code, "ConflictError");
    assert.equal(response.data, undefined);
  });
});

describe("ExpireBookingHolds API contracts", () => {
  it("maps ExpireBookingHoldsRequest and success response", () => {
    const request: ExpireBookingHoldsRequest = {
      now: "  2026-08-02T12:00:00.000Z  ",
      bookingReferences: ["  b1  "],
    };
    const input = toExpireBookingHoldsInput(request);
    assert.equal(input.now, "2026-08-02T12:00:00.000Z");
    assert.deepEqual(input.bookingReferences, ["b1"]);

    const response = toExpireBookingHoldsResponse(
      success({
        bookings: [
          {
            bookingReference: "b1",
            resourceReference: "r1",
            customerReference: "c1",
            startAt: "2026-08-02T10:00:00.000Z",
            endAt: "2026-08-02T11:00:00.000Z",
            status: "Expired",
          },
        ],
        expiredBookingReferences: ["b1"],
        processedCount: 1,
      }),
    );
    assert.equal(isApiSuccess(response), true);
    if (!isApiSuccess(response)) return;
    assert.equal(response.data.expiredBookingReferences.length, 1);
    assert.equal(response.error, undefined);
  });

  it("maps ExpireBookingHolds failure to error envelope", () => {
    const response = toExpireBookingHoldsResponse(
      failure({
        code: "ForbiddenError",
        message: "Booking hold expiration denied",
      }),
    );
    assert.equal(isApiFailure(response), true);
    if (!isApiFailure(response)) return;
    assert.equal(response.error.code, "ForbiddenError");
    assert.equal(response.data, undefined);
  });
});
