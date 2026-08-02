/**
 * Booking Modification Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_MODIFICATION_KINDS,
  BOOKING_MODIFICATION_STATUSES,
  createBookingModification,
  isBookingModification,
  isBookingModificationKind,
  isBookingModificationStatus,
  resetBookingModificationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Modification Boundary", () => {
  beforeEach(() => {
    resetBookingModificationReferenceSequence();
  });

  it("creates Modification Boundary context", () => {
    const modification = createBookingModification({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      modificationKind: BOOKING_MODIFICATION_KINDS.CustomerRequested,
      actorReference: "actor-1",
      reasonReference: "reason-1",
    });
    assert.equal(isBookingModification(modification), true);
    assert.equal(modification.modificationReference, "modification-1");
    assert.equal(modification.modificationStatus, "requested");
    assert.equal(modification.modificationKind, "booking.customer_requested");
    assert.equal(modification.bookingReference, "bk-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingModification({
          tenantReference: "  ",
          bookingReference: "bk-1",
          modificationKind: BOOKING_MODIFICATION_KINDS.OperatorRequested,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingModification(
          {
            tenantReference: "tenant-b",
            bookingReference: "bk-1",
            modificationKind: BOOKING_MODIFICATION_KINDS.BusinessRequired,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("requires bookingReference", () => {
    assert.throws(
      () =>
        createBookingModification({
          tenantReference: "tenant-a",
          bookingReference: "",
          modificationKind: BOOKING_MODIFICATION_KINDS.PolicyRequired,
        }),
      /bookingReference is required/,
    );

    assert.throws(
      () =>
        createBookingModification({
          tenantReference: "tenant-a",
          bookingReference: "  ",
          modificationKind: BOOKING_MODIFICATION_KINDS.Operational,
        }),
      /bookingReference is required/,
    );
  });

  it("accepts only known modification kinds and statuses", () => {
    assert.equal(
      isBookingModificationKind("booking.customer_requested"),
      true,
    );
    assert.equal(
      isBookingModificationKind("booking.operator_requested"),
      true,
    );
    assert.equal(isBookingModificationKind("booking.business_required"), true);
    assert.equal(isBookingModificationKind("booking.policy_required"), true);
    assert.equal(isBookingModificationKind("booking.operational"), true);
    assert.equal(isBookingModificationKind("booking.unknown"), false);

    assert.equal(isBookingModificationStatus("requested"), true);
    assert.equal(isBookingModificationStatus("approved"), true);
    assert.equal(isBookingModificationStatus("rejected"), true);
    assert.equal(isBookingModificationStatus("completed"), true);
    assert.equal(isBookingModificationStatus("cancelled"), true);
    assert.equal(isBookingModificationStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingModification({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          modificationKind: "booking.unknown" as never,
        }),
      /Unknown booking modification kind/,
    );

    const completed = createBookingModification({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      modificationKind: BOOKING_MODIFICATION_KINDS.CustomerRequested,
      modificationStatus: BOOKING_MODIFICATION_STATUSES.Completed,
    });
    assert.equal(completed.modificationStatus, "completed");
  });

  it("stays separated from Reschedule / Cancellation / Payment / Pricing / Notification / Workflow", () => {
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

    const modification = createBookingModification({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      modificationKind: BOOKING_MODIFICATION_KINDS.OperatorRequested,
      modificationStatus: BOOKING_MODIFICATION_STATUSES.Approved,
    });
    assert.equal(modification.modificationStatus, "approved");
    assert.equal(isBookingModification(modification), true);
  });
});
