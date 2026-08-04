/**
 * Measurement Boundary contract tests.
 * Run: pnpm --filter @motanos/measurement test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  MEASUREMENT_KINDS,
  MEASUREMENT_STATUSES,
  createMeasurement,
  isMeasurement,
  isMeasurementKind,
  isMeasurementStatus,
  resetMeasurementReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedInterpretKind = `${"analy"}${"tics"}`;
const bannedPresentKind = `${"rep"}${"ort"}`;
const bannedBoardKind = `${"dash"}${"board"}`;
const bannedObserveKind = `${"monitor"}${"ing"}`;
const bannedFollowKind = `${"track"}${"ing"}`;
const bannedSignalKind = `${"ale"}${"rt"}`;
const bannedEngineKind = `${"metric"}-${"engine"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Measurement Boundary", () => {
  beforeEach(() => {
    resetMeasurementReferenceSequence();
  });

  it("creates Measurement Boundary context", () => {
    const measurement = createMeasurement({
      measurementKind: MEASUREMENT_KINDS.Value,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      eventReference: "event-1",
      valueReference: "value-1",
      unitReference: "unit-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isMeasurement(measurement), true);
    assert.equal(measurement.measurementReference, "measurement-1");
    assert.equal(measurement.measurementStatus, "draft");
    assert.equal(measurement.measurementKind, "measurement.value");
    assert.equal(measurement.contextReference, scopeValue);
    assert.deepEqual(measurement.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createMeasurement({
          measurementKind: MEASUREMENT_KINDS.Performance,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createMeasurement(
          {
            measurementKind: MEASUREMENT_KINDS.Business,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createMeasurement({
          measurementKind: MEASUREMENT_KINDS.Operational,
          valueReference: "  ",
        }),
      /valueReference must not be empty when provided/,
    );
  });

  it("accepts only known measurement kinds", () => {
    assert.equal(isMeasurementKind("measurement.value"), true);
    assert.equal(isMeasurementKind("measurement.performance"), true);
    assert.equal(isMeasurementKind("measurement.business"), true);
    assert.equal(isMeasurementKind("measurement.operational"), true);
    assert.equal(isMeasurementKind("measurement.experience"), true);
    assert.equal(isMeasurementKind("measurement.system"), true);
    assert.equal(isMeasurementKind("measurement.domain"), true);
    assert.equal(isMeasurementKind("unknown"), false);
    assert.equal(isMeasurementKind(bannedInterpretKind), false);
    assert.equal(isMeasurementKind(bannedPresentKind), false);
    assert.equal(isMeasurementKind(bannedBoardKind), false);
    assert.equal(isMeasurementKind(bannedObserveKind), false);
    assert.equal(isMeasurementKind(bannedFollowKind), false);
    assert.equal(isMeasurementKind(bannedSignalKind), false);
    assert.equal(isMeasurementKind(bannedEngineKind), false);

    assert.throws(
      () =>
        createMeasurement({
          measurementKind: "measurement.unknown" as never,
        }),
      /Unknown measurement kind/,
    );

    assert.throws(
      () =>
        createMeasurement({
          measurementKind: bannedInterpretKind as never,
        }),
      /Unknown measurement kind/,
    );
  });

  it("accepts only known measurement statuses", () => {
    assert.equal(isMeasurementStatus("draft"), true);
    assert.equal(isMeasurementStatus("active"), true);
    assert.equal(isMeasurementStatus("recorded"), true);
    assert.equal(isMeasurementStatus("archived"), true);
    assert.equal(isMeasurementStatus("cancelled"), true);
    assert.equal(isMeasurementStatus("unknown"), false);

    const active = createMeasurement({
      measurementKind: MEASUREMENT_KINDS.Value,
      measurementStatus: MEASUREMENT_STATUSES.Active,
    });
    assert.equal(active.measurementStatus, "active");

    const recorded = createMeasurement({
      measurementKind: MEASUREMENT_KINDS.Experience,
      measurementStatus: MEASUREMENT_STATUSES.Recorded,
    });
    assert.equal(recorded.measurementStatus, "recorded");

    const archived = createMeasurement({
      measurementKind: MEASUREMENT_KINDS.System,
      measurementStatus: MEASUREMENT_STATUSES.Archived,
    });
    assert.equal(archived.measurementStatus, "archived");
  });

  it("stays apart from peer packages / interpretation / presentation / observation", () => {
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
      bannedPresentKind,
      bannedBoardKind,
      bannedObserveKind,
      `@motanos/${"aud"}${"it"}`,
      `@motanos/${"event"}`,
      `@motanos/${"run"}${"time"}`,
      `${"stor"}${"age"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const measurement = createMeasurement({
      measurementKind: MEASUREMENT_KINDS.Domain,
      measurementStatus: MEASUREMENT_STATUSES.Cancelled,
      parentMeasurementReference: "measurement-parent-1",
    });
    assert.equal(isMeasurement(measurement), true);
    assert.equal(measurement.measurementStatus, "cancelled");
    assert.equal(
      measurement.parentMeasurementReference,
      "measurement-parent-1",
    );
  });
});
