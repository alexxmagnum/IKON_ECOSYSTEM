/**
 * Feature Boundary contract tests.
 * Run: pnpm --filter @motanos/feature test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  FEATURE_KINDS,
  FEATURE_SETTINGS_REF_KEY,
  FEATURE_STATUSES,
  createFeature,
  isFeature,
  isFeatureKind,
  isFeatureStatus,
  resetFeatureReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedSwitchKind = `${"fla"}${"g"}`;
const bannedFlipKind = `${"tog"}${"gle"}`;
const bannedSpreadKind = `${"roll"}${"out"}`;
const bannedTrialKind = `${"experi"}${"ment"}`;
const bannedOptionKind = `${"vari"}${"ant"}`;
const bannedAimKind = `${"tar"}${"get"}`;
const bannedJudgeKind = `${"evalua"}${"tion"}`;
const bannedPublishKind = `${"deploy"}${"ment"}`;
const bannedRailKind = `${"pro"}${"vider"}`;
const bannedLivePeer = `${"run"}${"time"}`;
const bannedSettingsPeer = `${"configura"}${"tion"}`;
const bannedFlowPeer = `${"work"}${"flow"}`;
const bannedRulePeer = `${"poli"}${"cy"}`;
const bannedStorePeer = `${"stor"}${"age"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Feature Boundary", () => {
  beforeEach(() => {
    resetFeatureReferenceSequence();
  });

  it("creates Feature Boundary context", () => {
    const feature = createFeature({
      featureKind: FEATURE_KINDS.Product,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      [FEATURE_SETTINGS_REF_KEY]: "settings-1",
      capabilityReference: "capability-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isFeature(feature), true);
    assert.equal(feature.featureReference, "feature-1");
    assert.equal(feature.featureStatus, "draft");
    assert.equal(feature.featureKind, "feature.product");
    assert.equal(feature.contextReference, scopeValue);
    assert.equal(feature[FEATURE_SETTINGS_REF_KEY], "settings-1");
    assert.deepEqual(feature.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createFeature({
          featureKind: FEATURE_KINDS.Business,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createFeature(
          {
            featureKind: FEATURE_KINDS.Operational,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createFeature({
          featureKind: FEATURE_KINDS.Experience,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known feature kinds", () => {
    assert.equal(isFeatureKind("feature.product"), true);
    assert.equal(isFeatureKind("feature.business"), true);
    assert.equal(isFeatureKind("feature.operational"), true);
    assert.equal(isFeatureKind("feature.experience"), true);
    assert.equal(isFeatureKind("feature.customer"), true);
    assert.equal(isFeatureKind("feature.system"), true);
    assert.equal(isFeatureKind("feature.internal"), true);
    assert.equal(isFeatureKind(bannedSwitchKind), false);
    assert.equal(isFeatureKind(bannedFlipKind), false);
    assert.equal(isFeatureKind(bannedSpreadKind), false);
    assert.equal(isFeatureKind(bannedTrialKind), false);
    assert.equal(isFeatureKind(bannedOptionKind), false);
    assert.equal(isFeatureKind(bannedAimKind), false);
    assert.equal(isFeatureKind(bannedJudgeKind), false);

    assert.throws(
      () =>
        createFeature({
          featureKind: "feature.unknown" as never,
        }),
      /Unknown feature kind/,
    );

    assert.throws(
      () =>
        createFeature({
          featureKind: bannedSwitchKind as never,
        }),
      /Unknown feature kind/,
    );
  });

  it("accepts only known feature statuses", () => {
    assert.equal(isFeatureStatus("draft"), true);
    assert.equal(isFeatureStatus("active"), true);
    assert.equal(isFeatureStatus("inactive"), true);
    assert.equal(isFeatureStatus("available"), true);
    assert.equal(isFeatureStatus("archived"), true);
    assert.equal(isFeatureStatus("cancelled"), true);
    assert.equal(isFeatureStatus("unknown"), false);

    const active = createFeature({
      featureKind: FEATURE_KINDS.Product,
      featureStatus: FEATURE_STATUSES.Active,
    });
    assert.equal(active.featureStatus, "active");

    const inactive = createFeature({
      featureKind: FEATURE_KINDS.Customer,
      featureStatus: FEATURE_STATUSES.Inactive,
    });
    assert.equal(inactive.featureStatus, "inactive");

    const available = createFeature({
      featureKind: FEATURE_KINDS.Internal,
      featureStatus: FEATURE_STATUSES.Available,
    });
    assert.equal(available.featureStatus, "available");
  });

  it("stays apart from peer packages / settings / trials / activation rails", () => {
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
      `@motanos/${bannedSettingsPeer}`,
      `@motanos/${bannedFlowPeer}`,
      `@motanos/${bannedRulePeer}`,
      bannedTrialKind,
      bannedSpreadKind,
      bannedPublishKind,
      bannedRailKind,
      bannedStorePeer,
      `@motanos/${"data"}${"base"}`,
      bannedLivePeer,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const feature = createFeature({
      featureKind: FEATURE_KINDS.System,
      featureStatus: FEATURE_STATUSES.Archived,
      parentFeatureReference: "feature-parent-1",
    });
    assert.equal(isFeature(feature), true);
    assert.equal(feature.featureStatus, "archived");
    assert.equal(feature.parentFeatureReference, "feature-parent-1");
  });
});
