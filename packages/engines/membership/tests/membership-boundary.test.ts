/**
 * Membership Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/membership test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  MEMBERSHIP_KINDS,
  MEMBERSHIP_STATUSES,
  createMembership,
  isMembership,
  isMembershipKind,
  isMembershipStatus,
  resetMembershipReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Membership Engine Boundary", () => {
  beforeEach(() => {
    resetMembershipReferenceSequence();
  });

  it("creates Membership Boundary context", () => {
    const membership = createMembership({
      tenantReference: "tenant-a",
      identityReference: "identity-1",
      membershipKind: MEMBERSHIP_KINDS.Member,
      organizationReference: "org-1",
      startReference: "start-1",
      endReference: "end-1",
    });
    assert.equal(isMembership(membership), true);
    assert.equal(membership.membershipReference, "membership-1");
    assert.equal(membership.membershipStatus, "draft");
    assert.equal(membership.membershipKind, "membership.member");
    assert.equal(membership.identityReference, "identity-1");
    assert.equal(membership.tenantReference, "tenant-a");
  });

  it("requires identityReference and tenant isolation", () => {
    assert.throws(
      () =>
        createMembership({
          tenantReference: "  ",
          identityReference: "identity-1",
          membershipKind: MEMBERSHIP_KINDS.Player,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createMembership({
          tenantReference: "tenant-a",
          identityReference: "  ",
          membershipKind: MEMBERSHIP_KINDS.Partner,
        }),
      /identityReference is required/,
    );

    assert.throws(
      () =>
        createMembership(
          {
            tenantReference: "tenant-b",
            identityReference: "identity-1",
            membershipKind: MEMBERSHIP_KINDS.Staff,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("accepts only known membership kinds", () => {
    assert.equal(isMembershipKind("membership.member"), true);
    assert.equal(isMembershipKind("membership.player"), true);
    assert.equal(isMembershipKind("membership.partner"), true);
    assert.equal(isMembershipKind("membership.staff"), true);
    assert.equal(isMembershipKind("membership.vip"), true);
    assert.equal(isMembershipKind("membership.operational"), true);
    assert.equal(isMembershipKind("membership.unknown"), false);

    assert.throws(
      () =>
        createMembership({
          tenantReference: "tenant-a",
          identityReference: "identity-1",
          membershipKind: "membership.unknown" as never,
        }),
      /Unknown membership kind/,
    );
  });

  it("accepts only known membership statuses", () => {
    assert.equal(isMembershipStatus("draft"), true);
    assert.equal(isMembershipStatus("active"), true);
    assert.equal(isMembershipStatus("paused"), true);
    assert.equal(isMembershipStatus("expired"), true);
    assert.equal(isMembershipStatus("cancelled"), true);
    assert.equal(isMembershipStatus("unknown"), false);

    const active = createMembership({
      tenantReference: "tenant-a",
      identityReference: "identity-1",
      membershipKind: MEMBERSHIP_KINDS.Vip,
      membershipStatus: MEMBERSHIP_STATUSES.Active,
    });
    assert.equal(active.membershipStatus, "active");

    const paused = createMembership({
      tenantReference: "tenant-a",
      identityReference: "identity-1",
      membershipKind: MEMBERSHIP_KINDS.Operational,
      membershipStatus: MEMBERSHIP_STATUSES.Paused,
    });
    assert.equal(paused.membershipStatus, "paused");
  });

  it("stays separated from Identity / Booking / Commerce / Auth packages", () => {
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/identity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/auth"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );

    const membership = createMembership({
      tenantReference: "tenant-a",
      identityReference: "identity-1",
      membershipKind: MEMBERSHIP_KINDS.Member,
      membershipStatus: MEMBERSHIP_STATUSES.Expired,
    });
    assert.equal(isMembership(membership), true);
    assert.equal(membership.membershipStatus, "expired");
  });
});
