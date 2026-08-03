/**
 * Booking Pricing Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_PRICING_OPERATIONS,
  createBookingPricing,
  isBookingPricingOperation,
  isPricingDecision,
} from "../src/index.js";

describe("Booking Pricing Boundary", () => {
  it("returns a valid pricing decision", async () => {
    const pricing = createBookingPricing({
      pricingReference: "pricing-a",
      tenantReference: "tenant-a",
      amountReference: "amount-100",
      currency: "EUR",
    });

    const decision = await pricing.evaluate({
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      operation: BOOKING_PRICING_OPERATIONS.Create,
      bookingReference: "bk-1",
      resourceReference: "res-1",
      membershipReference: "mem-1",
    });

    assert.equal(isPricingDecision(decision), true);
    assert.equal(decision.allowed, true);
    assert.equal(decision.amountReference, "amount-100");
    assert.equal(decision.currency, "EUR");
    assert.equal(decision.pricingReference, "pricing-a");
  });

  it("rejects missing tenantReference", async () => {
    const pricing = createBookingPricing();
    const decision = await pricing.evaluate({
      tenantReference: "  ",
      actorReference: "actor-1",
      operation: BOOKING_PRICING_OPERATIONS.Confirm,
    });
    assert.equal(decision.allowed, false);
    assert.match(decision.reason ?? "", /tenantReference is required/);
  });

  it("rejects missing actorReference", async () => {
    const pricing = createBookingPricing({ tenantReference: "tenant-a" });
    const decision = await pricing.evaluate({
      tenantReference: "tenant-a",
      actorReference: "",
      operation: BOOKING_PRICING_OPERATIONS.Cancel,
    });
    assert.equal(decision.allowed, false);
    assert.match(decision.reason ?? "", /actorReference is required/);
  });

  it("rejects cross-tenant evaluation", async () => {
    const pricing = createBookingPricing({
      tenantReference: "tenant-a",
      pricingReference: "pricing-tenant-a",
    });

    const decision = await pricing.evaluate({
      tenantReference: "tenant-b",
      actorReference: "actor-1",
      operation: BOOKING_PRICING_OPERATIONS.Reschedule,
    });
    assert.equal(decision.allowed, false);
    assert.match(decision.reason ?? "", /does not apply to this tenant/);
  });

  it("accepts known pricing operations", () => {
    assert.equal(isBookingPricingOperation("booking.create"), true);
    assert.equal(isBookingPricingOperation("booking.confirm"), true);
    assert.equal(isBookingPricingOperation("booking.reschedule"), true);
    assert.equal(isBookingPricingOperation("booking.cancel"), true);
    assert.equal(isBookingPricingOperation("booking.unknown"), false);
  });
});
