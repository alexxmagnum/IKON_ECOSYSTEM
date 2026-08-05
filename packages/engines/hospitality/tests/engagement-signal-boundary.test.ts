/**
 * Hospitality Engagement Signal contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_SIGNAL_KINDS,
  ENGAGEMENT_SIGNAL_STATUSES,
  createEngagementSignal,
  isEngagementSignalKind,
  isEngagementSignalStatus,
  isHospitalityEngagementSignal,
  resetEngagementSignalReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const engagementSignalsRoot = join(packageRoot, "src", "engagement-signals");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Signal Boundary", () => {
  beforeEach(() => {
    resetEngagementSignalReferenceSequence();
  });

  it("creates EngagementSignal", () => {
    const signal = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      engagementReference: "engagement-1",
      memberReference: "member-1",
      communityReference: "community-1",
      activityReference: "activity-1",
      suggestionReference: "suggestion-1",
      ruleReference: "rule-1",
      contextReference: "context-1",
      sourceReference: "source-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementSignal(signal), true);
    assert.equal(signal.signalReference, "engagement-signal-1");
    assert.equal(signal.signalStatus, "draft");
    assert.equal(signal.signalKind, "signal.activity");
    assert.equal(signal.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(signal, "value"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(signal, "score"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(signal, "ranking"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(signal, "priority"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(signal, "recommendation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(signal, "decision"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(signal, "action"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Member,
      hospitalityReference: hospitalityBusiness,
      memberReference: "member-ikon",
    });
    const marina = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Member,
      hospitalityReference: otherHospitalityBusiness,
      memberReference: "member-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.signalReference, marina.signalReference);
    assert.notEqual(ikon.memberReference, marina.memberReference);

    assert.throws(
      () =>
        createEngagementSignal({
          signalKind: ENGAGEMENT_SIGNAL_KINDS.Community,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementSignal(
          {
            signalKind: ENGAGEMENT_SIGNAL_KINDS.Business,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known engagement-signal kinds", () => {
    assert.equal(isEngagementSignalKind("signal.engagement"), true);
    assert.equal(isEngagementSignalKind("signal.activity"), true);
    assert.equal(isEngagementSignalKind("signal.community"), true);
    assert.equal(isEngagementSignalKind("signal.member"), true);
    assert.equal(isEngagementSignalKind("signal.business"), true);
    assert.equal(isEngagementSignalKind("signal.experience"), true);
    assert.equal(isEngagementSignalKind("signal.internal"), true);
    assert.equal(isEngagementSignalKind("analytics.metric"), false);
    assert.equal(isEngagementSignalKind("ai.insight"), false);

    const kinds = [
      ENGAGEMENT_SIGNAL_KINDS.Engagement,
      ENGAGEMENT_SIGNAL_KINDS.Activity,
      ENGAGEMENT_SIGNAL_KINDS.Community,
      ENGAGEMENT_SIGNAL_KINDS.Member,
      ENGAGEMENT_SIGNAL_KINDS.Business,
      ENGAGEMENT_SIGNAL_KINDS.Experience,
      ENGAGEMENT_SIGNAL_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const signal = createEngagementSignal({
        signalKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(signal.signalKind, kind);
    }

    assert.throws(
      () =>
        createEngagementSignal({
          signalKind: "signal.unknown" as never,
        }),
      /Unknown engagement-signal kind/,
    );
  });

  it("accepts only known engagement-signal statuses", () => {
    assert.equal(isEngagementSignalStatus("draft"), true);
    assert.equal(isEngagementSignalStatus("observed"), true);
    assert.equal(isEngagementSignalStatus("active"), true);
    assert.equal(isEngagementSignalStatus("processed"), true);
    assert.equal(isEngagementSignalStatus("inactive"), true);
    assert.equal(isEngagementSignalStatus("archived"), true);
    assert.equal(isEngagementSignalStatus("cancelled"), true);
    assert.equal(isEngagementSignalStatus("unknown"), false);
    assert.equal(isEngagementSignalStatus("decided"), false);

    const observed = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Engagement,
      signalStatus: ENGAGEMENT_SIGNAL_STATUSES.Observed,
    });
    assert.equal(observed.signalStatus, "observed");

    const active = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Activity,
      signalStatus: ENGAGEMENT_SIGNAL_STATUSES.Active,
    });
    assert.equal(active.signalStatus, "active");

    const processed = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Community,
      signalStatus: ENGAGEMENT_SIGNAL_STATUSES.Processed,
    });
    assert.equal(processed.signalStatus, "processed");

    const inactive = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Experience,
      signalStatus: ENGAGEMENT_SIGNAL_STATUSES.Inactive,
    });
    assert.equal(inactive.signalStatus, "inactive");
  });

  it("stays apart from AI / decision / automation / recommendation / execution / reward logic", () => {
    const signalSources = readdirSync(engagementSignalsRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(engagementSignalsRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(signalSources.includes("ai logic"), false);
    assert.equal(signalSources.includes("decision logic"), false);
    assert.equal(signalSources.includes("automation"), false);
    assert.equal(signalSources.includes("recommendation"), false);
    assert.equal(signalSources.includes("execution"), false);
    assert.equal(signalSources.includes("reward logic"), false);

    assert.equal(signalSources.includes("processsignal"), false);
    assert.equal(signalSources.includes("interpretsignal"), false);
    assert.equal(signalSources.includes("triggerrule"), false);
    assert.equal(signalSources.includes("generatesuggestion"), false);
    assert.equal(signalSources.includes("executeaction"), false);

    assert.equal(signalSources.includes("value?:"), false);
    assert.equal(signalSources.includes("score?:"), false);
    assert.equal(signalSources.includes("ranking?:"), false);
    assert.equal(signalSources.includes("priority?:"), false);
    assert.equal(signalSources.includes("recommendation?:"), false);
    assert.equal(signalSources.includes("decision?:"), false);
    assert.equal(signalSources.includes("action?:"), false);

    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/signals"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/events"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/analytics"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/ai"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/intelligence"),
      false,
    );

    const signal = createEngagementSignal({
      signalKind: ENGAGEMENT_SIGNAL_KINDS.Internal,
      signalStatus: ENGAGEMENT_SIGNAL_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      sourceReference: "source-archived-1",
    });
    assert.equal(isHospitalityEngagementSignal(signal), true);
    assert.equal(signal.signalStatus, "archived");
    assert.equal(signal.sourceReference, "source-archived-1");
  });
});
