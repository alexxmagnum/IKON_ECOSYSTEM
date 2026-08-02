/**
 * Policy Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/policy test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  POLICY_KINDS,
  POLICY_STATUSES,
  createPolicy,
  isPolicy,
  isPolicyKind,
  isPolicyStatus,
  resetPolicyReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Policy Engine Boundary", () => {
  beforeEach(() => {
    resetPolicyReferenceSequence();
  });

  it("creates Policy Boundary context", () => {
    const policy = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Membership,
      nameReference: "name-premium-only",
      contextReference: "context-1",
      ownerReference: "owner-1",
    });
    assert.equal(isPolicy(policy), true);
    assert.equal(policy.policyReference, "policy-1");
    assert.equal(policy.policyStatus, "draft");
    assert.equal(policy.policyKind, "policy.membership");
    assert.equal(policy.tenantReference, "tenant-a");
    assert.equal(policy.nameReference, "name-premium-only");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createPolicy({
          tenantReference: "  ",
          policyKind: POLICY_KINDS.Business,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createPolicy(
          {
            tenantReference: "tenant-b",
            policyKind: POLICY_KINDS.Booking,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createPolicy({
          tenantReference: "tenant-a",
          policyKind: POLICY_KINDS.Resource,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known policy kinds", () => {
    assert.equal(isPolicyKind("policy.business"), true);
    assert.equal(isPolicyKind("policy.membership"), true);
    assert.equal(isPolicyKind("policy.booking"), true);
    assert.equal(isPolicyKind("policy.commerce"), true);
    assert.equal(isPolicyKind("policy.resource"), true);
    assert.equal(isPolicyKind("policy.operational"), true);
    assert.equal(isPolicyKind("policy.unknown"), false);

    assert.throws(
      () =>
        createPolicy({
          tenantReference: "tenant-a",
          policyKind: "policy.unknown" as never,
        }),
      /Unknown policy kind/,
    );
  });

  it("accepts only known policy statuses", () => {
    assert.equal(isPolicyStatus("draft"), true);
    assert.equal(isPolicyStatus("active"), true);
    assert.equal(isPolicyStatus("paused"), true);
    assert.equal(isPolicyStatus("expired"), true);
    assert.equal(isPolicyStatus("archived"), true);
    assert.equal(isPolicyStatus("cancelled"), true);
    assert.equal(isPolicyStatus("unknown"), false);

    const active = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Commerce,
      policyStatus: POLICY_STATUSES.Active,
    });
    assert.equal(active.policyStatus, "active");

    const expired = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Operational,
      policyStatus: POLICY_STATUSES.Expired,
    });
    assert.equal(expired.policyStatus, "expired");
  });

  it("stays separated from domain engines / access-control packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/membership"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/identity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/resource"),
      false,
    );

    const policy = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Booking,
      policyStatus: POLICY_STATUSES.Paused,
      descriptionReference: "desc-1",
      parentPolicyReference: "policy-parent-1",
    });
    assert.equal(isPolicy(policy), true);
    assert.equal(policy.policyStatus, "paused");
    assert.equal(policy.parentPolicyReference, "policy-parent-1");
  });
});
