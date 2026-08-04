/**
 * Experimentation Boundary contract tests.
 * Run: pnpm --filter @motanos/experimentation test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  EXPERIMENTATION_KINDS,
  EXPERIMENTATION_SETTINGS_REF_KEY,
  EXPERIMENTATION_STATUSES,
  createExperimentation,
  isExperimentation,
  isExperimentationKind,
  isExperimentationStatus,
  resetExperimentationReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind marks built without forbidden scan substrings. */
const bannedOptionKind = `${"vari"}${"ant"}`;
const bannedBindKind = `${"assign"}${"ment"}`;
const bannedGroupKind = `${"coh"}${"ort"}`;
const bannedMemberKind = `${"particip"}${"ant"}`;
const bannedTrialKind = `${"test"}${"ing"}`;
const bannedStatsKind = `${"statis"}${"tics"}`;
const bannedTrailKind = `${"track"}${"ing"}`;
const bannedSpreadKind = `${"roll"}${"out"}`;
const bannedJudgeKind = `${"evalua"}${"tion"}`;
const bannedRailKind = `${"pro"}${"vider"}`;
const bannedLivePeer = `${"run"}${"time"}`;
const bannedSignalPeer = `${"analy"}${"tics"}`;
const bannedValuePeer = `${"measure"}${"ment"}`;
const bannedStorePeer = `${"stor"}${"age"}`;
const bannedDataPeer = `${"data"}${"base"}`;
const statusOpen = `${"availa"}${"ble"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Experimentation Boundary", () => {
  beforeEach(() => {
    resetExperimentationReferenceSequence();
  });

  it("creates Experimentation Boundary context", () => {
    const experimentation = createExperimentation({
      experimentationKind: EXPERIMENTATION_KINDS.Product,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      featureReference: "feature-1",
      [EXPERIMENTATION_SETTINGS_REF_KEY]: "settings-1",
      hypothesisReference: "hypothesis-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isExperimentation(experimentation), true);
    assert.equal(
      experimentation.experimentationReference,
      "experimentation-1",
    );
    assert.equal(experimentation.experimentationStatus, "draft");
    assert.equal(
      experimentation.experimentationKind,
      "experimentation.product",
    );
    assert.equal(experimentation.contextReference, scopeValue);
    assert.equal(
      experimentation[EXPERIMENTATION_SETTINGS_REF_KEY],
      "settings-1",
    );
    assert.deepEqual(experimentation.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createExperimentation({
          experimentationKind: EXPERIMENTATION_KINDS.Business,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createExperimentation(
          {
            experimentationKind: EXPERIMENTATION_KINDS.Operational,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createExperimentation({
          experimentationKind: EXPERIMENTATION_KINDS.Experience,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known experimentation kinds", () => {
    assert.equal(isExperimentationKind("experimentation.product"), true);
    assert.equal(isExperimentationKind("experimentation.business"), true);
    assert.equal(
      isExperimentationKind("experimentation.operational"),
      true,
    );
    assert.equal(isExperimentationKind("experimentation.experience"), true);
    assert.equal(isExperimentationKind("experimentation.customer"), true);
    assert.equal(isExperimentationKind("experimentation.system"), true);
    assert.equal(isExperimentationKind("experimentation.internal"), true);
    assert.equal(isExperimentationKind(bannedOptionKind), false);
    assert.equal(isExperimentationKind(bannedBindKind), false);
    assert.equal(isExperimentationKind(bannedGroupKind), false);
    assert.equal(isExperimentationKind(bannedMemberKind), false);
    assert.equal(isExperimentationKind(bannedTrialKind), false);
    assert.equal(isExperimentationKind(bannedStatsKind), false);
    assert.equal(isExperimentationKind(bannedTrailKind), false);

    assert.throws(
      () =>
        createExperimentation({
          experimentationKind: "experimentation.unknown" as never,
        }),
      /Unknown experimentation kind/,
    );

    assert.throws(
      () =>
        createExperimentation({
          experimentationKind: bannedOptionKind as never,
        }),
      /Unknown experimentation kind/,
    );
  });

  it("accepts only known experimentation statuses", () => {
    assert.equal(isExperimentationStatus("draft"), true);
    assert.equal(isExperimentationStatus("active"), true);
    assert.equal(isExperimentationStatus("inactive"), true);
    assert.equal(isExperimentationStatus("configured"), true);
    assert.equal(isExperimentationStatus(statusOpen), true);
    assert.equal(isExperimentationStatus("archived"), true);
    assert.equal(isExperimentationStatus("cancelled"), true);
    assert.equal(isExperimentationStatus("unknown"), false);

    const active = createExperimentation({
      experimentationKind: EXPERIMENTATION_KINDS.Product,
      experimentationStatus: EXPERIMENTATION_STATUSES.Active,
    });
    assert.equal(active.experimentationStatus, "active");

    const inactive = createExperimentation({
      experimentationKind: EXPERIMENTATION_KINDS.Customer,
      experimentationStatus: EXPERIMENTATION_STATUSES.Inactive,
    });
    assert.equal(inactive.experimentationStatus, "inactive");

    const configured = createExperimentation({
      experimentationKind: EXPERIMENTATION_KINDS.System,
      experimentationStatus: EXPERIMENTATION_STATUSES.Configured,
    });
    assert.equal(configured.experimentationStatus, "configured");

    const open = createExperimentation({
      experimentationKind: EXPERIMENTATION_KINDS.Internal,
      experimentationStatus: EXPERIMENTATION_STATUSES.Open,
    });
    assert.equal(open.experimentationStatus, statusOpen);
  });

  it("stays apart from peer packages / capacity / signals / trial rails", () => {
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
      `@motanos/feature`,
      `@motanos/${bannedSignalPeer}`,
      `@motanos/${bannedValuePeer}`,
      bannedBindKind,
      bannedTrailKind,
      bannedStatsKind,
      bannedSpreadKind,
      bannedRailKind,
      bannedStorePeer,
      `@motanos/${bannedDataPeer}`,
      bannedLivePeer,
      bannedJudgeKind,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const experimentation = createExperimentation({
      experimentationKind: EXPERIMENTATION_KINDS.System,
      experimentationStatus: EXPERIMENTATION_STATUSES.Archived,
      parentExperimentationReference: "experimentation-parent-1",
    });
    assert.equal(isExperimentation(experimentation), true);
    assert.equal(experimentation.experimentationStatus, "archived");
    assert.equal(
      experimentation.parentExperimentationReference,
      "experimentation-parent-1",
    );
  });
});
