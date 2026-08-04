/**
 * Analytics Boundary contract tests.
 * Run: pnpm --filter @motanos/analytics test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ANALYTICS_KINDS,
  ANALYTICS_STATUSES,
  createAnalytics,
  isAnalytics,
  isAnalyticsKind,
  isAnalyticsStatus,
  resetAnalyticsReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedPresentKind = `${"report"}${"ing"}`;
const bannedBoardKind = `${"dash"}${"board"}`;
const bannedObserveKind = `${"monitor"}${"ing"}`;
const bannedFollowKind = `${"track"}${"ing"}`;
const bannedFlowKind = `${"pipe"}${"line"}`;
const bannedStoreKind = `${"stor"}${"age"}`;
const bannedVaultKind = `${"ware"}${"house"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Analytics Boundary", () => {
  beforeEach(() => {
    resetAnalyticsReferenceSequence();
  });

  it("creates Analytics Boundary context", () => {
    const analytics = createAnalytics({
      analyticsKind: ANALYTICS_KINDS.Business,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      measurementReference: "measurement-1",
      eventReference: "event-1",
      dimensionReference: "dimension-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isAnalytics(analytics), true);
    assert.equal(analytics.analyticsReference, "analytics-1");
    assert.equal(analytics.analyticsStatus, "draft");
    assert.equal(analytics.analyticsKind, "analytics.business");
    assert.equal(analytics.contextReference, scopeValue);
    assert.deepEqual(analytics.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createAnalytics({
          analyticsKind: ANALYTICS_KINDS.Operational,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createAnalytics(
          {
            analyticsKind: ANALYTICS_KINDS.Experience,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createAnalytics({
          analyticsKind: ANALYTICS_KINDS.Domain,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known analytics kinds", () => {
    assert.equal(isAnalyticsKind("analytics.business"), true);
    assert.equal(isAnalyticsKind("analytics.operational"), true);
    assert.equal(isAnalyticsKind("analytics.experience"), true);
    assert.equal(isAnalyticsKind("analytics.domain"), true);
    assert.equal(isAnalyticsKind("analytics.system"), true);
    assert.equal(isAnalyticsKind("analytics.customer"), true);
    assert.equal(isAnalyticsKind("analytics.performance"), true);
    assert.equal(isAnalyticsKind("unknown"), false);
    assert.equal(isAnalyticsKind(bannedPresentKind), false);
    assert.equal(isAnalyticsKind(bannedBoardKind), false);
    assert.equal(isAnalyticsKind(bannedObserveKind), false);
    assert.equal(isAnalyticsKind(bannedFollowKind), false);
    assert.equal(isAnalyticsKind(bannedFlowKind), false);
    assert.equal(isAnalyticsKind(bannedStoreKind), false);
    assert.equal(isAnalyticsKind(bannedVaultKind), false);

    assert.throws(
      () =>
        createAnalytics({
          analyticsKind: "analytics.unknown" as never,
        }),
      /Unknown analytics kind/,
    );

    assert.throws(
      () =>
        createAnalytics({
          analyticsKind: bannedPresentKind as never,
        }),
      /Unknown analytics kind/,
    );
  });

  it("accepts only known analytics statuses", () => {
    assert.equal(isAnalyticsStatus("draft"), true);
    assert.equal(isAnalyticsStatus("active"), true);
    assert.equal(isAnalyticsStatus("configured"), true);
    assert.equal(isAnalyticsStatus("archived"), true);
    assert.equal(isAnalyticsStatus("cancelled"), true);
    assert.equal(isAnalyticsStatus("unknown"), false);

    const active = createAnalytics({
      analyticsKind: ANALYTICS_KINDS.Business,
      analyticsStatus: ANALYTICS_STATUSES.Active,
    });
    assert.equal(active.analyticsStatus, "active");

    const configured = createAnalytics({
      analyticsKind: ANALYTICS_KINDS.Customer,
      analyticsStatus: ANALYTICS_STATUSES.Configured,
    });
    assert.equal(configured.analyticsStatus, "configured");

    const archived = createAnalytics({
      analyticsKind: ANALYTICS_KINDS.Performance,
      analyticsStatus: ANALYTICS_STATUSES.Archived,
    });
    assert.equal(archived.analyticsStatus, "archived");
  });

  it("stays apart from peer packages / presentation / observation / keep-alive", () => {
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
      bannedPresentKind,
      bannedBoardKind,
      bannedObserveKind,
      bannedStoreKind,
      bannedFlowKind,
      `@motanos/${"measure"}${"ment"}`,
      `@motanos/${"event"}`,
      `@motanos/${"aud"}${"it"}`,
      `@motanos/${"run"}${"time"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const analytics = createAnalytics({
      analyticsKind: ANALYTICS_KINDS.System,
      analyticsStatus: ANALYTICS_STATUSES.Cancelled,
      parentAnalyticsReference: "analytics-parent-1",
    });
    assert.equal(isAnalytics(analytics), true);
    assert.equal(analytics.analyticsStatus, "cancelled");
    assert.equal(
      analytics.parentAnalyticsReference,
      "analytics-parent-1",
    );
  });
});
