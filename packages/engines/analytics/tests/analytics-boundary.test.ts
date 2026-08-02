/**
 * Analytics Engine Boundary contract tests.
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
  createAnalyticsEvent,
  isAnalyticsEvent,
  isAnalyticsKind,
  isAnalyticsStatus,
  resetAnalyticsReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Analytics Engine Boundary", () => {
  beforeEach(() => {
    resetAnalyticsReferenceSequence();
  });

  it("creates Analytics Boundary context", () => {
    const analyticsEvent = createAnalyticsEvent({
      tenantReference: "tenant-a",
      analyticsKind: ANALYTICS_KINDS.Conversion,
      actorReference: "actor-1",
      entityReference: "bk-1",
      entityKind: "booking",
      metricReference: "metric-bookings-completed",
    });
    assert.equal(isAnalyticsEvent(analyticsEvent), true);
    assert.equal(analyticsEvent.analyticsReference, "analytics-1");
    assert.equal(analyticsEvent.analyticsStatus, "draft");
    assert.equal(analyticsEvent.analyticsKind, "analytics.conversion");
    assert.equal(analyticsEvent.tenantReference, "tenant-a");
    assert.equal(analyticsEvent.entityReference, "bk-1");
    assert.equal(analyticsEvent.metricReference, "metric-bookings-completed");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createAnalyticsEvent({
          tenantReference: "  ",
          analyticsKind: ANALYTICS_KINDS.Usage,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createAnalyticsEvent(
          {
            tenantReference: "tenant-b",
            analyticsKind: ANALYTICS_KINDS.Lifecycle,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createAnalyticsEvent({
          tenantReference: "tenant-a",
          analyticsKind: ANALYTICS_KINDS.Engagement,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known analytics kinds", () => {
    assert.equal(isAnalyticsKind("analytics.usage"), true);
    assert.equal(isAnalyticsKind("analytics.lifecycle"), true);
    assert.equal(isAnalyticsKind("analytics.engagement"), true);
    assert.equal(isAnalyticsKind("analytics.conversion"), true);
    assert.equal(isAnalyticsKind("analytics.performance"), true);
    assert.equal(isAnalyticsKind("analytics.operational"), true);
    assert.equal(isAnalyticsKind("analytics.unknown"), false);

    assert.throws(
      () =>
        createAnalyticsEvent({
          tenantReference: "tenant-a",
          analyticsKind: "analytics.unknown" as never,
        }),
      /Unknown analytics kind/,
    );
  });

  it("accepts only known analytics statuses", () => {
    assert.equal(isAnalyticsStatus("draft"), true);
    assert.equal(isAnalyticsStatus("pending"), true);
    assert.equal(isAnalyticsStatus("recorded"), true);
    assert.equal(isAnalyticsStatus("processed"), true);
    assert.equal(isAnalyticsStatus("archived"), true);
    assert.equal(isAnalyticsStatus("failed"), true);
    assert.equal(isAnalyticsStatus("cancelled"), true);
    assert.equal(isAnalyticsStatus("unknown"), false);

    const pending = createAnalyticsEvent({
      tenantReference: "tenant-a",
      analyticsKind: ANALYTICS_KINDS.Usage,
      analyticsStatus: ANALYTICS_STATUSES.Pending,
    });
    assert.equal(pending.analyticsStatus, "pending");

    const processed = createAnalyticsEvent({
      tenantReference: "tenant-a",
      analyticsKind: ANALYTICS_KINDS.Performance,
      analyticsStatus: ANALYTICS_STATUSES.Processed,
    });
    assert.equal(processed.analyticsStatus, "processed");
  });

  it("stays separated from audit / commerce / metric vendors", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/audit"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payment"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );

    const analyticsEvent = createAnalyticsEvent({
      tenantReference: "tenant-a",
      analyticsKind: ANALYTICS_KINDS.Engagement,
      analyticsStatus: ANALYTICS_STATUSES.Recorded,
      entityReference: "community-1",
      entityKind: "community",
      sourceReference: "source-1",
    });
    assert.equal(isAnalyticsEvent(analyticsEvent), true);
    assert.equal(analyticsEvent.analyticsStatus, "recorded");
    assert.equal(analyticsEvent.entityReference, "community-1");
  });
});
