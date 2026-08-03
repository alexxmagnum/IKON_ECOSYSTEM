/**
 * Booking Membership Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_MEMBERSHIP_KINDS,
  BOOKING_MEMBERSHIP_STATUSES,
  createBookingMembership,
  isBookingMembership,
  isBookingMembershipKind,
  isBookingMembershipPort,
  membershipBelongsToTenant,
  resetBookingMembershipReferenceSequence,
  type BookingMembershipPort,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Membership Boundary", () => {
  beforeEach(() => {
    resetBookingMembershipReferenceSequence();
  });

  it("creates a valid membership contract", () => {
    const membership = createBookingMembership({
      tenantReference: "tenant-a",
      memberReference: "member-1",
      membershipKind: BOOKING_MEMBERSHIP_KINDS.Member,
      metadata: { correlationId: "corr-1" },
    });

    assert.deepEqual(membership, {
      membershipReference: "membership-1",
      tenantReference: "tenant-a",
      memberReference: "member-1",
      membershipKind: "booking.member",
      status: BOOKING_MEMBERSHIP_STATUSES.Active,
      metadata: { correlationId: "corr-1" },
    });
    assert.equal(isBookingMembership(membership), true);
  });

  it("accepts only known membership kinds", () => {
    assert.equal(isBookingMembershipKind("booking.member"), true);
    assert.equal(isBookingMembershipKind("booking.guest"), true);
    assert.equal(isBookingMembershipKind("booking.vip"), true);
    assert.equal(isBookingMembershipKind("booking.staff"), true);
    assert.equal(isBookingMembershipKind("booking.partner"), true);
    assert.equal(isBookingMembershipKind("booking.unknown"), false);

    const guest = createBookingMembership({
      tenantReference: "tenant-a",
      memberReference: "member-2",
      membershipKind: BOOKING_MEMBERSHIP_KINDS.Guest,
      status: BOOKING_MEMBERSHIP_STATUSES.Pending,
    });
    assert.equal(guest.membershipKind, "booking.guest");
    assert.equal(guest.status, "pending");

    assert.throws(
      () =>
        createBookingMembership({
          tenantReference: "tenant-a",
          memberReference: "member-1",
          membershipKind: "booking.unknown" as never,
        }),
      /Unknown booking membership kind/,
    );
  });

  it("requires tenantReference and memberReference", () => {
    assert.throws(
      () =>
        createBookingMembership({
          tenantReference: "  ",
          memberReference: "member-1",
          membershipKind: BOOKING_MEMBERSHIP_KINDS.Vip,
        }),
      /tenantReference is required/,
    );
    assert.throws(
      () =>
        createBookingMembership({
          tenantReference: "tenant-a",
          memberReference: "",
          membershipKind: BOOKING_MEMBERSHIP_KINDS.Staff,
        }),
      /memberReference is required/,
    );
  });

  it("isolates memberships by tenantReference", () => {
    const membership = createBookingMembership({
      tenantReference: "tenant-a",
      memberReference: "member-1",
      membershipKind: BOOKING_MEMBERSHIP_KINDS.Partner,
      membershipReference: "mem-1",
    });
    assert.equal(membershipBelongsToTenant(membership, "tenant-a"), true);
    assert.equal(membershipBelongsToTenant(membership, "tenant-b"), false);
    assert.equal(membershipBelongsToTenant(membership, "  "), false);
  });

  it("has no external CRM provider dependencies", () => {
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

    const port: BookingMembershipPort = {
      async getMembership() {
        return null;
      },
    };
    assert.equal(isBookingMembershipPort(port), true);
  });
});
