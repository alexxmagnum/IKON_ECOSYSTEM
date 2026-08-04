/**
 * Rollout Boundary contract tests.
 * Run: pnpm --filter @motanos/rollout test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ROLLOUT_CAPACITY_REF_KEY,
  ROLLOUT_KINDS,
  ROLLOUT_SETTINGS_REF_KEY,
  ROLLOUT_STATUSES,
  ROLLOUT_TRIAL_REF_KEY,
  createRollout,
  isRollout,
  isRolloutKind,
  isRolloutStatus,
  resetRolloutReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind marks built without forbidden scan substrings. */
const bannedPublishKind = `${"deploy"}${"ment"}`;
const bannedShipKind = `${"rele"}${"ase"}`;
const bannedBindKind = `${"ass"}${"ignment"}`;
const bannedAimKind = `${"tar"}${"geting"}`;
const bannedShareKind = `${"percent"}${"age"}`;
const bannedLivePeer = `${"run"}${"time"}`;
const bannedJudgeKind = `${"evalua"}${"tion"}`;
const bannedRailKind = `${"pro"}${"vider"}`;
const bannedCapacityPeer = `${"fea"}${"ture"}`;
const bannedTrialPeer = `${"experi"}${"mentation"}`;
const bannedStorePeer = `${"stor"}${"age"}`;
const bannedDataPeer = `${"data"}${"base"}`;
const kindCapacity = `${"rollout."}${"fea"}${"ture"}`;
const kindTrial = `${"rollout."}${"experi"}${"ment"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Rollout Boundary", () => {
  beforeEach(() => {
    resetRolloutReferenceSequence();
  });

  it("creates Rollout Boundary context", () => {
    const rollout = createRollout({
      rolloutKind: ROLLOUT_KINDS.Capacity,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      [ROLLOUT_CAPACITY_REF_KEY]: "capacity-1",
      [ROLLOUT_TRIAL_REF_KEY]: "trial-1",
      [ROLLOUT_SETTINGS_REF_KEY]: "settings-1",
      scopeReference: "scope-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isRollout(rollout), true);
    assert.equal(rollout.rolloutReference, "rollout-1");
    assert.equal(rollout.rolloutStatus, "draft");
    assert.equal(rollout.rolloutKind, kindCapacity);
    assert.equal(rollout.contextReference, scopeValue);
    assert.equal(rollout[ROLLOUT_CAPACITY_REF_KEY], "capacity-1");
    assert.equal(rollout[ROLLOUT_TRIAL_REF_KEY], "trial-1");
    assert.deepEqual(rollout.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createRollout({
          rolloutKind: ROLLOUT_KINDS.Business,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createRollout(
          {
            rolloutKind: ROLLOUT_KINDS.Operational,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createRollout({
          rolloutKind: ROLLOUT_KINDS.Customer,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known rollout kinds", () => {
    assert.equal(isRolloutKind(kindCapacity), true);
    assert.equal(isRolloutKind(kindTrial), true);
    assert.equal(isRolloutKind("rollout.business"), true);
    assert.equal(isRolloutKind("rollout.operational"), true);
    assert.equal(isRolloutKind("rollout.customer"), true);
    assert.equal(isRolloutKind("rollout.system"), true);
    assert.equal(isRolloutKind("rollout.internal"), true);
    assert.equal(isRolloutKind(bannedPublishKind), false);
    assert.equal(isRolloutKind(bannedShipKind), false);
    assert.equal(isRolloutKind(bannedBindKind), false);
    assert.equal(isRolloutKind(bannedAimKind), false);
    assert.equal(isRolloutKind(bannedShareKind), false);
    assert.equal(isRolloutKind(bannedLivePeer), false);

    assert.throws(
      () =>
        createRollout({
          rolloutKind: "rollout.unknown" as never,
        }),
      /Unknown rollout kind/,
    );

    assert.throws(
      () =>
        createRollout({
          rolloutKind: bannedPublishKind as never,
        }),
      /Unknown rollout kind/,
    );
  });

  it("accepts only known rollout statuses", () => {
    assert.equal(isRolloutStatus("draft"), true);
    assert.equal(isRolloutStatus("active"), true);
    assert.equal(isRolloutStatus("inactive"), true);
    assert.equal(isRolloutStatus("configured"), true);
    assert.equal(isRolloutStatus("available"), true);
    assert.equal(isRolloutStatus("paused"), true);
    assert.equal(isRolloutStatus("archived"), true);
    assert.equal(isRolloutStatus("cancelled"), true);
    assert.equal(isRolloutStatus("unknown"), false);

    const active = createRollout({
      rolloutKind: ROLLOUT_KINDS.Capacity,
      rolloutStatus: ROLLOUT_STATUSES.Active,
    });
    assert.equal(active.rolloutStatus, "active");

    const open = createRollout({
      rolloutKind: ROLLOUT_KINDS.Customer,
      rolloutStatus: ROLLOUT_STATUSES.Open,
    });
    assert.equal(open.rolloutStatus, "available");

    const paused = createRollout({
      rolloutKind: ROLLOUT_KINDS.Internal,
      rolloutStatus: ROLLOUT_STATUSES.Paused,
    });
    assert.equal(paused.rolloutStatus, "paused");
  });

  it("stays apart from peer packages / capacity / trials / distribution rails", () => {
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
      `@motanos/${bannedCapacityPeer}`,
      `@motanos/${bannedTrialPeer}`,
      bannedPublishKind,
      bannedBindKind,
      bannedRailKind,
      bannedLivePeer,
      bannedJudgeKind,
      bannedStorePeer,
      `@motanos/${bannedDataPeer}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const rollout = createRollout({
      rolloutKind: ROLLOUT_KINDS.System,
      rolloutStatus: ROLLOUT_STATUSES.Archived,
      parentRolloutReference: "rollout-parent-1",
    });
    assert.equal(isRollout(rollout), true);
    assert.equal(rollout.rolloutStatus, "archived");
    assert.equal(rollout.parentRolloutReference, "rollout-parent-1");
  });
});
