/**
 * Booking Policy Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_POLICY_OPERATIONS,
  createBookingPolicy,
  isPolicyDecision,
} from "../src/index.js";

describe("Booking Policy Boundary", () => {
  it("allows a valid booking operation", async () => {
    const policy = createBookingPolicy({
      policyReference: "policy-a",
      tenantReference: "tenant-a",
    });

    const decision = await policy.evaluate({
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      operation: BOOKING_POLICY_OPERATIONS.Create,
      bookingReference: "bk-1",
    });

    assert.equal(isPolicyDecision(decision), true);
    assert.equal(decision.allowed, true);
    assert.equal(decision.policyReference, "policy-a");
  });

  it("rejects missing tenantReference", async () => {
    const policy = createBookingPolicy();
    const decision = await policy.evaluate({
      tenantReference: "  ",
      actorReference: "actor-1",
      operation: BOOKING_POLICY_OPERATIONS.Confirm,
    });
    assert.equal(decision.allowed, false);
    assert.match(decision.reason ?? "", /tenantReference is required/);
  });

  it("rejects cross-tenant evaluation", async () => {
    const policy = createBookingPolicy({
      tenantReference: "tenant-a",
      policyReference: "policy-tenant-a",
    });

    const wrongTenant = await policy.evaluate({
      tenantReference: "tenant-b",
      actorReference: "actor-1",
      operation: BOOKING_POLICY_OPERATIONS.Cancel,
    });
    assert.equal(wrongTenant.allowed, false);
    assert.match(wrongTenant.reason ?? "", /does not apply to this tenant/);

    const bookingMismatch = await policy.evaluate({
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      operation: BOOKING_POLICY_OPERATIONS.Reschedule,
      bookingReference: "bk-1",
      bookingTenantReference: "tenant-b",
    });
    assert.equal(bookingMismatch.allowed, false);
    assert.match(
      bookingMismatch.reason ?? "",
      /booking does not belong to tenant context/,
    );
  });

  it("rejects missing actorReference", async () => {
    const policy = createBookingPolicy({ tenantReference: "tenant-a" });
    const decision = await policy.evaluate({
      tenantReference: "tenant-a",
      actorReference: "",
      operation: BOOKING_POLICY_OPERATIONS.Create,
    });
    assert.equal(decision.allowed, false);
    assert.match(decision.reason ?? "", /actorReference is required/);
  });
});
