/**
 * Booking Approval Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_APPROVAL_KINDS,
  BOOKING_APPROVAL_STATUSES,
  createBookingApproval,
  isBookingApproval,
  isBookingApprovalKind,
  isBookingApprovalStatus,
  resetBookingApprovalReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Approval Boundary", () => {
  beforeEach(() => {
    resetBookingApprovalReferenceSequence();
  });

  it("creates Approval Boundary context", () => {
    const approval = createBookingApproval({
      tenantReference: "tenant-a",
      approvalKind: BOOKING_APPROVAL_KINDS.Confirmation,
      bookingReference: "bk-1",
      actorReference: "actor-1",
      requestedByReference: "requester-1",
    });
    assert.equal(isBookingApproval(approval), true);
    assert.equal(approval.approvalReference, "approval-1");
    assert.equal(approval.approvalStatus, "pending");
    assert.equal(approval.approvalKind, "booking.confirmation");
    assert.equal(approval.requestedByReference, "requester-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingApproval({
          tenantReference: "  ",
          approvalKind: BOOKING_APPROVAL_KINDS.ManualReview,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingApproval(
          {
            tenantReference: "tenant-b",
            approvalKind: BOOKING_APPROVAL_KINDS.Exception,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingApproval({
          tenantReference: "tenant-a",
          approvalKind: BOOKING_APPROVAL_KINDS.Override,
          approvalReference: "  ",
        }),
      /approvalReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createBookingApproval({
          tenantReference: "tenant-a",
          approvalKind: BOOKING_APPROVAL_KINDS.Confirmation,
          requestedByReference: "  ",
        }),
      /requestedByReference must not be empty when provided/,
    );
  });

  it("accepts only known approval kinds and statuses", () => {
    assert.equal(isBookingApprovalKind("booking.confirmation"), true);
    assert.equal(isBookingApprovalKind("booking.manual_review"), true);
    assert.equal(isBookingApprovalKind("booking.exception"), true);
    assert.equal(isBookingApprovalKind("booking.override"), true);
    assert.equal(isBookingApprovalKind("booking.unknown"), false);

    assert.equal(isBookingApprovalStatus("pending"), true);
    assert.equal(isBookingApprovalStatus("approved"), true);
    assert.equal(isBookingApprovalStatus("rejected"), true);
    assert.equal(isBookingApprovalStatus("expired"), true);
    assert.equal(isBookingApprovalStatus("cancelled"), true);
    assert.equal(isBookingApprovalStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingApproval({
          tenantReference: "tenant-a",
          approvalKind: "booking.unknown" as never,
        }),
      /Unknown booking approval kind/,
    );

    const approved = createBookingApproval({
      tenantReference: "tenant-a",
      approvalKind: BOOKING_APPROVAL_KINDS.ManualReview,
      approvalStatus: BOOKING_APPROVAL_STATUSES.Approved,
    });
    assert.equal(approved.approvalStatus, "approved");
  });

  it("stays separated from Authorization / Payment / Workflow providers", () => {
    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(pkg.devDependencies, undefined);

    const approval = createBookingApproval({
      tenantReference: "tenant-a",
      approvalKind: BOOKING_APPROVAL_KINDS.Confirmation,
      approvalStatus: BOOKING_APPROVAL_STATUSES.Rejected,
    });
    assert.equal(approval.approvalStatus, "rejected");
    assert.equal(isBookingApproval(approval), true);
  });
});
