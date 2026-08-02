/**
 * Booking domain event contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_DOMAIN_EVENT_TYPES,
  createBookingCancelledEvent,
  createBookingConfirmedEvent,
  createBookingCreatedEvent,
  createBookingHoldExpiredEvent,
  createBookingRescheduledEvent,
  isDomainEvent,
} from "../src/index.js";

const TENANT = "tenant-1";

describe("DomainEvent base", () => {
  it("exposes eventType, aggregateReference, occurredAt", () => {
    const event = createBookingCreatedEvent({
      bookingReference: "booking-1",
      resourceReference: "resource-1",
      customerReference: "customer-1",
      tenantReference: TENANT,
      occurredAt: "2026-08-02T10:00:00.000Z",
    });

    assert.equal(isDomainEvent(event), true);
    assert.equal(event.eventType, BOOKING_DOMAIN_EVENT_TYPES.BookingCreated);
    assert.equal(event.aggregateReference, "booking-1");
    assert.equal(event.occurredAt, "2026-08-02T10:00:00.000Z");
  });
});

describe("BookingCreatedEvent", () => {
  it("builds a valid created structure", () => {
    const event = createBookingCreatedEvent({
      bookingReference: "booking-1",
      resourceReference: "resource-1",
      customerReference: "customer-1",
      tenantReference: TENANT,
      occurredAt: "2026-08-02T10:00:00.000Z",
    });

    assert.equal(event.eventType, "booking.created");
    assert.equal(event.bookingReference, "booking-1");
    assert.equal(event.resourceReference, "resource-1");
    assert.equal(event.customerReference, "customer-1");
    assert.equal(event.aggregateReference, event.bookingReference);
  });
});

describe("BookingConfirmedEvent", () => {
  it("builds a valid confirmed structure", () => {
    const event = createBookingConfirmedEvent({
      bookingReference: "booking-1",
      tenantReference: TENANT,
      occurredAt: "2026-08-02T10:05:00.000Z",
    });

    assert.equal(event.eventType, "booking.confirmed");
    assert.equal(event.bookingReference, "booking-1");
    assert.equal(event.lifecycleEvent, "booking.confirmed_without_payment");
    assert.equal(event.occurredAt, "2026-08-02T10:05:00.000Z");
  });
});

describe("BookingCancelledEvent", () => {
  it("builds a valid cancelled structure with optional metadata", () => {
    const event = createBookingCancelledEvent({
      bookingReference: "booking-1",
      tenantReference: TENANT,
      occurredAt: "2026-08-02T10:10:00.000Z",
      metadata: { reason: "user_request" },
    });

    assert.equal(event.eventType, "booking.cancelled");
    assert.equal(event.bookingReference, "booking-1");
    assert.equal(event.lifecycleEvent, "booking.cancelled_by_user");
    assert.equal(event.metadata?.reason, "user_request");
  });
});

describe("BookingRescheduledEvent", () => {
  it("includes previous and new windows", () => {
    const event = createBookingRescheduledEvent({
      bookingReference: "booking-1",
      tenantReference: TENANT,
      previousStartAt: "2026-08-02T10:00:00.000Z",
      previousEndAt: "2026-08-02T11:00:00.000Z",
      newStartAt: "2026-08-02T14:00:00.000Z",
      newEndAt: "2026-08-02T15:00:00.000Z",
      occurredAt: "2026-08-02T10:15:00.000Z",
    });

    assert.equal(event.eventType, "booking.rescheduled");
    assert.equal(event.previousStartAt, "2026-08-02T10:00:00.000Z");
    assert.equal(event.previousEndAt, "2026-08-02T11:00:00.000Z");
    assert.equal(event.newStartAt, "2026-08-02T14:00:00.000Z");
    assert.equal(event.newEndAt, "2026-08-02T15:00:00.000Z");
    assert.equal(event.bookingReference, "booking-1");
  });
});

describe("BookingHoldExpiredEvent", () => {
  it("includes bookingReference and timestamp", () => {
    const event = createBookingHoldExpiredEvent({
      bookingReference: "booking-1",
      tenantReference: TENANT,
      occurredAt: "2026-08-02T10:20:00.000Z",
    });

    assert.equal(event.eventType, "booking.hold_expired");
    assert.equal(event.bookingReference, "booking-1");
    assert.equal(event.aggregateReference, "booking-1");
    assert.equal(event.occurredAt, "2026-08-02T10:20:00.000Z");
  });
});
