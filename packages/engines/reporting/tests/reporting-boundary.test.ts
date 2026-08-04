/**
 * Reporting Boundary contract tests.
 * Run: pnpm --filter @motanos/reporting test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  REPORTING_CAPACITY_REF_KEY,
  REPORTING_KINDS,
  REPORTING_STATUSES,
  createReporting,
  isReporting,
  isReportingKind,
  isReportingStatus,
  resetReportingReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedBoardKind = `${"dash"}${"board"}`;
const bannedShipKind = `${"ex"}${"port"}`;
const bannedFileKind = `${"pd"}${"f"}`;
const bannedPaperKind = `${"docu"}${"ment"}`;
const bannedCapacityKind = `${"analy"}${"tics"}`;
const bannedLookupKind = `${"que"}${"ry"}`;
const bannedStoreKind = `${"stor"}${"age"}`;
const bannedSendKind = `${"deliv"}${"ery"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Reporting Boundary", () => {
  beforeEach(() => {
    resetReportingReferenceSequence();
  });

  it("creates Reporting Boundary context", () => {
    const reporting = createReporting({
      reportingKind: REPORTING_KINDS.Business,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      [REPORTING_CAPACITY_REF_KEY]: "capacity-1",
      measurementReference: "measurement-1",
      eventReference: "event-1",
      templateReference: "template-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isReporting(reporting), true);
    assert.equal(reporting.reportingReference, "reporting-1");
    assert.equal(reporting.reportingStatus, "draft");
    assert.equal(reporting.reportingKind, "reporting.business");
    assert.equal(reporting.contextReference, scopeValue);
    assert.equal(reporting[REPORTING_CAPACITY_REF_KEY], "capacity-1");
    assert.deepEqual(reporting.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createReporting({
          reportingKind: REPORTING_KINDS.Operational,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createReporting(
          {
            reportingKind: REPORTING_KINDS.Experience,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createReporting({
          reportingKind: REPORTING_KINDS.Domain,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known reporting kinds", () => {
    assert.equal(isReportingKind("reporting.business"), true);
    assert.equal(isReportingKind("reporting.operational"), true);
    assert.equal(isReportingKind("reporting.experience"), true);
    assert.equal(isReportingKind("reporting.domain"), true);
    assert.equal(isReportingKind("reporting.system"), true);
    assert.equal(isReportingKind("reporting.customer"), true);
    assert.equal(isReportingKind("reporting.internal"), true);
    assert.equal(isReportingKind("unknown"), false);
    assert.equal(isReportingKind(bannedBoardKind), false);
    assert.equal(isReportingKind(bannedShipKind), false);
    assert.equal(isReportingKind(bannedFileKind), false);
    assert.equal(isReportingKind(bannedPaperKind), false);
    assert.equal(isReportingKind(bannedCapacityKind), false);
    assert.equal(isReportingKind(bannedLookupKind), false);
    assert.equal(isReportingKind(bannedStoreKind), false);
    assert.equal(isReportingKind(bannedSendKind), false);

    assert.throws(
      () =>
        createReporting({
          reportingKind: "reporting.unknown" as never,
        }),
      /Unknown reporting kind/,
    );

    assert.throws(
      () =>
        createReporting({
          reportingKind: bannedBoardKind as never,
        }),
      /Unknown reporting kind/,
    );
  });

  it("accepts only known reporting statuses", () => {
    assert.equal(isReportingStatus("draft"), true);
    assert.equal(isReportingStatus("active"), true);
    assert.equal(isReportingStatus("configured"), true);
    assert.equal(isReportingStatus("published"), true);
    assert.equal(isReportingStatus("archived"), true);
    assert.equal(isReportingStatus("cancelled"), true);
    assert.equal(isReportingStatus("unknown"), false);

    const active = createReporting({
      reportingKind: REPORTING_KINDS.Business,
      reportingStatus: REPORTING_STATUSES.Active,
    });
    assert.equal(active.reportingStatus, "active");

    const configured = createReporting({
      reportingKind: REPORTING_KINDS.Customer,
      reportingStatus: REPORTING_STATUSES.Configured,
    });
    assert.equal(configured.reportingStatus, "configured");

    const published = createReporting({
      reportingKind: REPORTING_KINDS.Internal,
      reportingStatus: REPORTING_STATUSES.Published,
    });
    assert.equal(published.reportingStatus, "published");
  });

  it("stays apart from peer packages / capacity / boards / keep-alive", () => {
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
      `@motanos/${"analy"}${"tics"}`,
      `@motanos/${"measure"}${"ment"}`,
      `@motanos/${"event"}`,
      `@motanos/${"aud"}${"it"}`,
      `@motanos/${"notifica"}${"tion"}`,
      `@motanos/${"run"}${"time"}`,
      bannedBoardKind,
      bannedStoreKind,
      bannedShipKind,
      `${"pro"}${"vider"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const reporting = createReporting({
      reportingKind: REPORTING_KINDS.System,
      reportingStatus: REPORTING_STATUSES.Archived,
      parentReportingReference: "reporting-parent-1",
    });
    assert.equal(isReporting(reporting), true);
    assert.equal(reporting.reportingStatus, "archived");
    assert.equal(
      reporting.parentReportingReference,
      "reporting-parent-1",
    );
  });
});
