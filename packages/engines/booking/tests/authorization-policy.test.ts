/**
 * BookingAuthorizationPolicy tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_AUTH_ACTIONS,
  createBookingAuthorizationPolicy,
  type BookingAuthorizationGateway,
} from "../src/index.js";

function gatewayAllow(): BookingAuthorizationGateway {
  return {
    async authorize() {
      return { allowed: true, reason: "permitted" };
    },
  };
}

function gatewayDeny(reason = "actor is not permitted"): BookingAuthorizationGateway {
  return {
    async authorize() {
      return { allowed: false, reason };
    },
  };
}

function gatewayDenyResource(
  blockedReference: string,
): BookingAuthorizationGateway {
  return {
    async authorize(input) {
      if (input.resourceReference === blockedReference) {
        return { allowed: false, reason: "resource not permitted" };
      }
      return { allowed: true, reason: "permitted" };
    },
  };
}

describe("BookingAuthorizationPolicy", () => {
  it("allows actor when gateway permits", async () => {
    const policy = createBookingAuthorizationPolicy(gatewayAllow());
    const decision = await policy.decide({
      actorReference: "actor-1",
      operation: "confirm",
      resourceType: "booking",
      resourceReference: "booking-1",
    });
    assert.equal(decision.allowed, true);
    assert.equal(decision.code, "Allowed");
    assert.equal(decision.action, BOOKING_AUTH_ACTIONS.confirm);
  });

  it("rejects actor when gateway denies", async () => {
    const policy = createBookingAuthorizationPolicy(gatewayDeny());
    const decision = await policy.decide({
      actorReference: "actor-denied",
      operation: "create",
      resourceType: "booking.resource",
      resourceReference: "resource-1",
    });
    assert.equal(decision.allowed, false);
    assert.equal(decision.code, "Denied");
    assert.equal(decision.reason, "actor is not permitted");
  });

  it("rejects when resource is not permitted", async () => {
    const policy = createBookingAuthorizationPolicy(
      gatewayDenyResource("booking-secret"),
    );
    const denied = await policy.decide({
      actorReference: "actor-1",
      operation: "read",
      resourceType: "booking",
      resourceReference: "booking-secret",
    });
    assert.equal(denied.allowed, false);
    assert.match(denied.reason ?? "", /resource not permitted/);

    const allowed = await policy.decide({
      actorReference: "actor-1",
      operation: "read",
      resourceType: "booking",
      resourceReference: "booking-public",
    });
    assert.equal(allowed.allowed, true);
  });

  it("does not treat Cancelled status as an authorization denial (domain rule)", async () => {
    const policy = createBookingAuthorizationPolicy(gatewayAllow());
    const decision = await policy.decide({
      actorReference: "actor-1",
      operation: "confirm",
      resourceType: "booking",
      resourceReference: "booking-1",
      booking: {
        bookingReference: "booking-1",
        ownerUserId: "customer-1",
        resourceId: "resource-1",
        status: "Cancelled",
      },
    });
    assert.equal(decision.allowed, true);
    assert.equal(decision.code, "Allowed");
  });

  it("denies mismatched booking context resourceReference", async () => {
    const policy = createBookingAuthorizationPolicy(gatewayAllow());
    const decision = await policy.decide({
      actorReference: "actor-1",
      operation: "confirm",
      resourceType: "booking",
      resourceReference: "booking-1",
      booking: {
        bookingReference: "booking-OTHER",
        ownerUserId: "customer-1",
        resourceId: "resource-1",
        status: "Draft",
      },
    });
    assert.equal(decision.allowed, false);
    assert.match(decision.reason ?? "", /does not match/);
  });

  it("denies missing actor / resource", async () => {
    const policy = createBookingAuthorizationPolicy(gatewayAllow());
    const noActor = await policy.decide({
      actorReference: "  ",
      operation: "list",
      resourceType: "booking.list",
      resourceReference: "bookings",
    });
    assert.equal(noActor.allowed, false);

    const noResource = await policy.decide({
      actorReference: "actor-1",
      operation: "list",
      resourceType: "",
      resourceReference: "",
    });
    assert.equal(noResource.allowed, false);
  });
});
