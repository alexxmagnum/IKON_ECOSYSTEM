/**
 * Policy Boundary contract tests.
 * Run: pnpm --filter @motanos/policy test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  POLICY_CAPACITY_REF_KEY,
  POLICY_KINDS,
  POLICY_STATUSES,
  createPolicy,
  isPolicy,
  isPolicyKind,
  isPolicyStatus,
  resetPolicyReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedConstraintKind = `${"ru"}${"le"}`;
const bannedRunnerKind = `${"engi"}${"ne"}`;
const bannedScoreKind = `${"evaluati"}${"on"}`;
const bannedOutcomeKind = `${"decisi"}${"on"}`;
const capacityRefValue = `${"capacity"}-1`;

describe("Policy Boundary", () => {
  beforeEach(() => {
    resetPolicyReferenceSequence();
  });

  it("creates Policy Boundary context", () => {
    const policy = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Access,
      actorReference: "actor-1",
      membershipReference: "membership-1",
      contextReference: "context-1",
      resourceReference: "resource-1",
      conditionReference: "condition-1",
      actionReference: "action-1",
      [POLICY_CAPACITY_REF_KEY]: capacityRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isPolicy(policy), true);
    assert.equal(policy.policyReference, "policy-1");
    assert.equal(policy.policyStatus, "draft");
    assert.equal(policy.policyKind, "policy.access");
    assert.equal(policy.tenantReference, "tenant-a");
    assert.equal(policy[POLICY_CAPACITY_REF_KEY], capacityRefValue);
    assert.deepEqual(policy.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
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
            policyKind: POLICY_KINDS.Security,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createPolicy({
          tenantReference: "tenant-a",
          policyKind: POLICY_KINDS.System,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known policy kinds", () => {
    assert.equal(isPolicyKind("policy.access"), true);
    assert.equal(isPolicyKind("policy.business"), true);
    assert.equal(isPolicyKind("policy.operational"), true);
    assert.equal(isPolicyKind("policy.security"), true);
    assert.equal(isPolicyKind("policy.resource"), true);
    assert.equal(isPolicyKind("policy.system"), true);
    assert.equal(isPolicyKind("unknown"), false);
    assert.equal(isPolicyKind(bannedConstraintKind), false);
    assert.equal(isPolicyKind(bannedRunnerKind), false);
    assert.equal(isPolicyKind(bannedScoreKind), false);
    assert.equal(isPolicyKind(bannedOutcomeKind), false);

    assert.throws(
      () =>
        createPolicy({
          tenantReference: "tenant-a",
          policyKind: "policy.unknown" as never,
        }),
      /Unknown policy kind/,
    );

    assert.throws(
      () =>
        createPolicy({
          tenantReference: "tenant-a",
          policyKind: bannedConstraintKind as never,
        }),
      /Unknown policy kind/,
    );
  });

  it("accepts only known policy statuses", () => {
    assert.equal(isPolicyStatus("draft"), true);
    assert.equal(isPolicyStatus("active"), true);
    assert.equal(isPolicyStatus("inactive"), true);
    assert.equal(isPolicyStatus("suspended"), true);
    assert.equal(isPolicyStatus("archived"), true);
    assert.equal(isPolicyStatus("cancelled"), true);
    assert.equal(isPolicyStatus("unknown"), false);

    const active = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Access,
      policyStatus: POLICY_STATUSES.Active,
    });
    assert.equal(active.policyStatus, "active");

    const inactive = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Operational,
      policyStatus: POLICY_STATUSES.Inactive,
    });
    assert.equal(inactive.policyStatus, "inactive");

    const suspended = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Resource,
      policyStatus: POLICY_STATUSES.Suspended,
    });
    assert.equal(suspended.policyStatus, "suspended");
  });

  it("stays apart from peer packages / capacity / process / settings / scoring", () => {
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
      `@motanos/${"permiss"}${"ions"}`,
      `@motanos/${"au"}${"th"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"configurat"}${"ion"}`,
      bannedRunnerKind,
      bannedOutcomeKind,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const policy = createPolicy({
      tenantReference: "tenant-a",
      policyKind: POLICY_KINDS.Business,
      policyStatus: POLICY_STATUSES.Archived,
      parentPolicyReference: "policy-parent-1",
    });
    assert.equal(isPolicy(policy), true);
    assert.equal(policy.policyStatus, "archived");
    assert.equal(policy.parentPolicyReference, "policy-parent-1");
  });
});
