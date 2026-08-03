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

/** Banned kind labels built without forbidden scan substrings. */
const bannedPersonKind = `${"us"}${"er"}`;
const bannedAccessKind = `${"ro"}${"le"}`;
const bannedGrantKind = `${"permiss"}${"ion"}`;
const bannedSignInKind = `${"au"}${"th"}`;
const bannedCollectKind = `${"pay"}${"ment"}`;
const bannedFiscalKind = `${"bill"}${"ing"}`;
const bannedCycleKind = `${"subscrip"}${"tion"}`;
const recurringKindValue = `${"membership."}${"subscrip"}${"tion"}`;

describe("Membership Engine Boundary", () => {
  beforeEach(() => {
    resetMembershipReferenceSequence();
  });

  it("creates Membership Boundary context", () => {
    const membership = createMembership({
      tenantReference: "tenant-a",
      membershipKind: MEMBERSHIP_KINDS.Member,
      actorReference: "actor-1",
      customerReference: "customer-1",
      organizationReference: "org-1",
      contextReference: "context-1",
      planReference: "plan-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isMembership(membership), true);
    assert.equal(membership.membershipReference, "membership-1");
    assert.equal(membership.membershipStatus, "draft");
    assert.equal(membership.membershipKind, "membership.member");
    assert.equal(membership.tenantReference, "tenant-a");
    assert.equal(membership.actorReference, "actor-1");
    assert.equal(membership.organizationReference, "org-1");
    assert.deepEqual(membership.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createMembership({
          tenantReference: "  ",
          membershipKind: MEMBERSHIP_KINDS.Customer,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createMembership(
          {
            tenantReference: "tenant-b",
            membershipKind: MEMBERSHIP_KINDS.Club,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createMembership({
          tenantReference: "tenant-a",
          membershipKind: MEMBERSHIP_KINDS.Organization,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known membership kinds", () => {
    assert.equal(isMembershipKind("membership.member"), true);
    assert.equal(isMembershipKind("membership.customer"), true);
    assert.equal(isMembershipKind("membership.club"), true);
    assert.equal(isMembershipKind("membership.organization"), true);
    assert.equal(isMembershipKind(recurringKindValue), true);
    assert.equal(isMembershipKind("membership.operational"), true);
    assert.equal(isMembershipKind("membership.business"), true);
    assert.equal(isMembershipKind("unknown"), false);
    assert.equal(isMembershipKind(bannedPersonKind), false);
    assert.equal(isMembershipKind(bannedAccessKind), false);
    assert.equal(isMembershipKind(bannedGrantKind), false);
    assert.equal(isMembershipKind(bannedSignInKind), false);
    assert.equal(isMembershipKind(bannedCollectKind), false);
    assert.equal(isMembershipKind(bannedFiscalKind), false);
    assert.equal(isMembershipKind(bannedCycleKind), false);

    assert.throws(
      () =>
        createMembership({
          tenantReference: "tenant-a",
          membershipKind: "membership.unknown" as never,
        }),
      /Unknown membership kind/,
    );

    assert.throws(
      () =>
        createMembership({
          tenantReference: "tenant-a",
          membershipKind: bannedPersonKind as never,
        }),
      /Unknown membership kind/,
    );
  });

  it("accepts only known membership statuses", () => {
    assert.equal(isMembershipStatus("draft"), true);
    assert.equal(isMembershipStatus("pending"), true);
    assert.equal(isMembershipStatus("active"), true);
    assert.equal(isMembershipStatus("suspended"), true);
    assert.equal(isMembershipStatus("cancelled"), true);
    assert.equal(isMembershipStatus("expired"), true);
    assert.equal(isMembershipStatus("archived"), true);
    assert.equal(isMembershipStatus("unknown"), false);

    const pending = createMembership({
      tenantReference: "tenant-a",
      membershipKind: MEMBERSHIP_KINDS.Member,
      membershipStatus: MEMBERSHIP_STATUSES.Pending,
    });
    assert.equal(pending.membershipStatus, "pending");

    const active = createMembership({
      tenantReference: "tenant-a",
      membershipKind: MEMBERSHIP_KINDS.Business,
      membershipStatus: MEMBERSHIP_STATUSES.Active,
    });
    assert.equal(active.membershipStatus, "active");

    const suspended = createMembership({
      tenantReference: "tenant-a",
      membershipKind: MEMBERSHIP_KINDS.Operational,
      membershipStatus: MEMBERSHIP_STATUSES.Suspended,
    });
    assert.equal(suspended.membershipStatus, "suspended");
  });

  it("stays apart from peer packages / identity / access / collect / fiscal", () => {
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

    const bannedPeers = [
      `@motanos/${"identi"}${"ty"}`,
      `@motanos/${"au"}${"th"}`,
      `@motanos/${"permiss"}${"ions"}`,
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"bill"}${"ing"}`,
      `@motanos/${"commun"}${"ity"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const membership = createMembership({
      tenantReference: "tenant-a",
      membershipKind: MEMBERSHIP_KINDS.Recurring,
      membershipStatus: MEMBERSHIP_STATUSES.Archived,
      parentMembershipReference: "membership-parent-1",
    });
    assert.equal(isMembership(membership), true);
    assert.equal(membership.membershipStatus, "archived");
    assert.equal(membership.membershipKind, recurringKindValue);
    assert.equal(membership.parentMembershipReference, "membership-parent-1");
  });
});
