/**
 * Booking audit contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_AUDIT_ACTIONS,
  createBookingAuditRecord,
  isBookingAuditRecord,
  resetBookingAuditReferenceSequence,
} from "../src/index.js";

describe("Booking audit contract", () => {
  beforeEach(() => {
    resetBookingAuditReferenceSequence();
  });

  it("creates a valid audit record", () => {
    const record = createBookingAuditRecord({
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      action: BOOKING_AUDIT_ACTIONS.BookingCreated,
      resourceType: "booking",
      resourceReference: "bk-1",
      occurredAt: "2026-08-01T12:00:00.000Z",
      metadata: { correlationId: "corr-1" },
    });

    assert.deepEqual(record, {
      auditReference: "audit-1",
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      action: "booking.created",
      resourceType: "booking",
      resourceReference: "bk-1",
      occurredAt: "2026-08-01T12:00:00.000Z",
      metadata: { correlationId: "corr-1" },
    });
    assert.equal(isBookingAuditRecord(record), true);
  });

  it("requires tenantReference", () => {
    assert.throws(
      () =>
        createBookingAuditRecord({
          tenantReference: "  ",
          actorReference: "actor-1",
          action: BOOKING_AUDIT_ACTIONS.BookingRead,
          resourceType: "booking",
          resourceReference: "bk-1",
        }),
      /tenantReference is required/,
    );
  });

  it("requires actorReference", () => {
    assert.throws(
      () =>
        createBookingAuditRecord({
          tenantReference: "tenant-a",
          actorReference: "",
          action: BOOKING_AUDIT_ACTIONS.BookingConfirmed,
          resourceType: "booking",
          resourceReference: "bk-1",
        }),
      /actorReference is required/,
    );
  });

  it("accepts only known audit actions", () => {
    const valid = createBookingAuditRecord({
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      action: BOOKING_AUDIT_ACTIONS.BookingCancelled,
      resourceType: "booking",
      resourceReference: "bk-1",
    });
    assert.equal(valid.action, "booking.cancelled");

    assert.throws(
      () =>
        createBookingAuditRecord({
          tenantReference: "tenant-a",
          actorReference: "actor-1",
          action: "booking.unknown" as never,
          resourceType: "booking",
          resourceReference: "bk-1",
        }),
      /Unknown booking audit action/,
    );
  });
});
